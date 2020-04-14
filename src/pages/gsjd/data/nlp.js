export const nlpTitle = {
  fzqj: '犯罪情节',
  fzxyr: '犯罪嫌疑人信息',
  zcfzqj: '侦查机关认定的犯罪情节',
  zcfzxyr: '侦查机关认定的犯罪嫌疑人信息'
};

export const aqjxConfig = {
  '盗窃罪': [
    {
      label: '案情摘要',
      type: 'textarea',
      required: true
    },
    {
      label: '时间',
      type: 'input',
      required: true
    },
    {
      label: '地点',
      type: 'input',
      required: true
    },{
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

    // {

    //   type: 'input'
    // },
    // {

    //   type: 'input',
    //   required: true
    // },
    // {

    //   type: 'input'
    // },
  ]
};
