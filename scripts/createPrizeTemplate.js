const XLSX = require('xlsx')

function createPrizeTemplate(data) {
    const templateData = [
        {
            [data.prizeConfigName]: '一等奖',
            [data.prizeConfigIsAll]: false,
            [data.prizeConfigCount]: 1,
            [data.prizeConfigDesc]: '一等奖描述',
        },
        {
            [data.prizeConfigName]: '二等奖',
            [data.prizeConfigIsAll]: false,
            [data.prizeConfigCount]: 2,
            [data.prizeConfigDesc]: '二等奖描述',
        },
        {
            [data.prizeConfigName]: '三等奖',
            [data.prizeConfigIsAll]: false,
            [data.prizeConfigCount]: 3,
            [data.prizeConfigDesc]: '三等奖描述',
        },
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    return wb
}

const dataEn = {
    prizeConfigName: 'Prize Name',
    prizeConfigIsAll: 'Full Participation',
    prizeConfigCount: 'Count',
    prizeConfigDesc: 'Description',
}

const dataZhCn = {
    prizeConfigName: '奖品名称',
    prizeConfigIsAll: '可重复',
    prizeConfigCount: '抽奖人数',
    prizeConfigDesc: '描述',
}

const enWb = createPrizeTemplate(dataEn)
XLSX.writeFile(enWb, 'public/prizeListTemplate-en.xlsx')

const zhCnWb = createPrizeTemplate(dataZhCn)
XLSX.writeFile(zhCnWb, 'public/奖品设置-zhCn.xlsx')

console.log('Prize template files created successfully')
