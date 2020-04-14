#!/bin/bash

cd $(dirname $0)

base=$(pwd)
log_dir=${base}/logs
pkg_dir=${base}/pkgs
mnt_dir=${base}/zips

function backup_log()
{
    appname=$1
    if [ -e ${log_dir}/${appname}.log ]; then
        mv logs/${appname}.log logs/history/${appname}.log.`date "+%Y%m%d_%H%M%S"`
    fi
}

function only_unzip()
{
    appname=$1
    if [ "${appname}" == "groovy-rules" ]; then
        echo 'yes'
    else
        echo 'no'
    fi
}

function start()
{
    appname=$1 # eg: ezfrontend
    pkgname=${pkg_dir}/${appname}.zip
    app_dir=${mnt_dir}/${appname}

    stop ${appname}

    if [ "$(only_unzip ${appname})" == "yes" ]; then
        echo -n $(date "+[%F %T] Unzipping ${appname} ... ")
        app_mnt_dir=${mnt_dir}/${appname}
        mkdir -p ${app_mnt_dir}
        (cd ${app_mnt_dir}; unzip -q ${pkgname})
        touch timestamp/${appname}.zip
        echo " Done"
    elif [ "dead" == "$(status ${appname})" ]; then
        backup_log ${appname}

        echo -n $(date "+[%F %T] Starting $(basename ${appname}) ... ")

        # 解压 & 创建容器
        app_mnt_dir=${mnt_dir}/${appname}
        mkdir -p ${app_mnt_dir}
        (cd ${app_mnt_dir}; unzip -q ${pkgname})

        if [ "${appname}" == "nlp" ]; then
            docker run -d \
                   --restart=always \
                   --name nlp \
                   -v ${mnt_dir}/nlp/:/version/ \
                   -v ${base}/logs/:/versions/log/ \
                   --net=host \
                   -e nlpkafka=zk1,zk2,zk3 \
                   nlp:1.0 \
                   > /dev/null
        elif [ "$(echo ${appname} | grep frontend)" != "" ]; then
            docker run -d \
                   --restart=always \
                   --network=host \
                   -e appname=${appname} \
                   --name=${appname} \
                   -v ${app_mnt_dir}/:/version/ \
                   -v ${log_dir}/:/log/ \
                   nodejs:6.0.1 \
                   > /dev/null
        else
            echo $(date "+[%F %T] Unsupported ${appname} !")
        fi

        # 更新时间戳
        touch timestamp/${appname}.zip
        echo " Done"
    else
        echo $(date "+[%F %T] Starting ${appname} ... already running!")
    fi
}

function stop()
{
    appname=$1

    # 删除容器
    if [ "$(docker ps -a | grep ${appname})" != "" ]; then
        echo -n $(date "+[%F %T] Killing ${appname} ...")
        docker rm -f ${appname} > /dev/null
        echo " Done"
    fi

    # 删除目录
    app_mnt_dir=${mnt_dir}/${appname}
    if [ -d ${app_mnt_dir} ]; then
        echo -n $(date "+[%F %T] Deleting ${appname} ...")
        rm -rf ${app_mnt_dir}
        echo " Done"
    fi
}

function status()
{
    appname=$1
    if [ "$(docker ps | grep ${appname} | grep -v grep)" == "" ]; then
        echo "dead"
    else
        echo "running"
    fi
}


function found_new_version()
{
    ver_name=$1
    date "+[%F %T] Found new version (${ver_name}), replacing after 20s ... "
    sleep 20
}

# 杀死删除的版本
function kill_app_which_was_deleted()
{
    for appname in $(docker ps -a --format "{{.Names}}" | grep frontend); do
        if [ ! -e ${pkg_dir}/${appname}.zip ]; then
            stop ${appname}
        fi
    done
}

# 重启有版本更新的 ver
function restart_app_which_was_updated()
{
    for zipfile in $(cd ${pkg_dir}; ls -1 *.zip 2>/dev/null); do
        appname=${zipfile%.*}
        pkgname=${pkg_dir}/${zipfile}
        timestamp=${base}/timestamp/${zipfile}
        if [ "$(only_unzip ${appname})" == "no" ] && [ "$(docker ps | grep ${appname})" == "" ]; then
            start ${appname}
        elif [ ${timestamp} -ot ${pkgname} ]; then
            found_new_version ${appname}
            stop ${appname}
            start ${appname}
        fi
    done
}

if [ ! -d timestamp ]; then mkdir timestamp; fi
if [ ! -d logs/history ]; then mkdir -p logs/history; fi

while [ 1 ]; do
    cd ${base}
    kill_app_which_was_deleted
    restart_app_which_was_updated
    sleep 3
done
