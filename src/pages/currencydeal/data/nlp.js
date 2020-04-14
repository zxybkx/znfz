export const nlpTitle = {
  fzqj: '犯罪情节',
  fzxyr: '犯罪嫌疑人信息',
  zcfzqj: '侦查机关认定的犯罪情节',
  zcfzxyr: '侦查机关认定的犯罪嫌疑人信息'
};

export const aqjxConfig = {
  '盗窃罪': [
    {
      label: '时间',
      type: 'datetime',
      required: true
    },
    {
      label: '地点',
      type: 'input',
      required: true
    }, {
      label: '参与人',
      type: 'select',
      required: true
    },
    {
      label: '被害人',
      type: 'select',
      required: true
    },
    {
      label: '财物',
      type: 'select',
      required: true
    },
    {
      label: '价值',
      type: 'money',
      required: false
    },
    {
      label: '盗窃类型',
      type: 'enume|daoqieleixing',
      required: true
    },
    {
      label: '盗窃手段',
      type: 'input',
      required: true
    },
    {
      label: '案情摘要',
      type: 'textarea',
      required: true
    },
    {
      label: '分析',
      type: 'textarea',
      required: true
    },
  ],
  '交通肇事罪': [
    {
      label: '交通事故发生时间',
      type: 'datetime',
      required: true
    },
    {
      label: '死亡人数',
      type: 'input',
      required: true
    }, {
      label: '重伤人数',
      type: 'input',
      required: true
    },
    {
      label: '嫌疑人所负责任',
      type: 'enume|zenren',
      required: true
    },
    {
      label: '造成公私财产直接损失金额',
      type: 'input',
      required: true
    },
    {
      label: '案情摘要',
      type: 'textarea',
      required: true
    },
    {
      label: '分析',
      type: 'textarea',
      required: true
    },
  ],
  '危险驾驶罪': [
    {
      label: '犯罪时间',
      type: 'datetime',
      required: true
    },
    {
      label: '所负责任',
      type: 'enume|zenren',
      required: true
    },
    {
      label: '血样酒精含量',
      type: 'input',
      required: true
    },
    {
      label: '案情摘要',
      type: 'textarea',
      required: true
    },
    {
      label: '分析',
      type: 'textarea',
      required: true
    },
  ],
  '故意伤害罪': [
    {
      label: '时间',
      type: 'datetime',
      required: true
    },
    {
      label: '重伤一级',
      type: 'people',
      required: true
    },
    {
      label: '重伤二级',
      type: 'people',
      required: true
    }, {
      label: '轻伤一级',
      type: 'people',
      required: true
    }, {
      label: '轻伤二级',
      type: 'people',
      required: true
    }, {
      label: '死亡人数',
      type: 'people',
      required: true
    },
    {
      label: '伤残等级',
      type: 'enume|shangcandengji',
      required: true
    },
    // {
    //   label: '事实情节',
    //   type: 'multiple|shishiqingjie',
    //   required: false
    // },
    {
      label: '本案犯罪嫌疑人',
      type: 'select|multiple',
      required: true
    },
    {
      label: '本笔事实其他参与人',
      type: 'select',
      required: false
    },
    {
      label: '案情摘要',
      type: 'textarea',
      required: true
    },
    {
      label: '分析',
      type: 'textarea',
      required: true
    },
  ],
  'tb': [
    {
      label: '时间',
      type: 'datetime',
      required: true
    },
    {
      label: '参与人',
      type: 'select',
      required: true
    },
    {
      label: '被害人',
      type: 'select',
      required: true
    },
    {
      label: '案情摘要',
      type: 'textarea',
      required: true
    },
    {
      label: '分析',
      type: 'textarea',
      required: true
    },
  ],
};

export const lxqjConfig = {
  '交通肇事罪': [
    {'酒后驾驶': '否'},
    {'吸毒驾驶': '否'},
    {'无驾驶资格': '否'},
    {'明知安全装置不全': '否'},
    {'明知安全机件失灵': '否'},
    {'明知无牌证': '否'},
    {'明知已报废': '否'},
    {'是否严重超载驾驶': '否'},
    {'逃离事故现场': '否'}
  ],

  '危险驾驶罪': [
    {'追逐竞速': '否'},
    {'驾驶校车超员或超速': '否'},
    {'旅客运输超员或超速': '否'},
    {'运送危化品': '否'},
    {'造成交通事故并逃逸': '否'},
    {'血液酒精含量达到200毫克/100毫升以上': '否'},
    {'在高速或城市快速路驾驶': '否'},
    {'驾驶载有乘客的营运机动车': '否'},
    {'有严重违反交通法规的行为': '否'},
    {'逃避、拒绝或阻碍公安机关依法检查': '否'},
    {'曾因酒后驾驶受过行政处罚和刑事追究': '否'}
  ],

  '故意伤害罪': [
    {'致人轻伤': '否'},
    {'致人重伤': '否'},
    {'致人死亡或以特别残忍手段致人重伤造成严重残疾': '否'},
  ],

};


export const ssqjName = {
  '交通肇事罪': '事实情节',
  '危险驾驶罪': '事实情节',
  '故意伤害罪': '法定情节'
}
