const XLSX = require('xlsx')

function createTestPrizeData(data) {
    const testData = [
        {
            [data.prizeConfigName]: '特等奖',
            [data.prizeConfigIsAll]: false,
            [data.prizeConfigCount]: 1,
            [data.prizeConfigDesc]: '特等奖描述',
            [data.prizeConfigImageUrl]: 'https://via.placeholder.com/200x200/FF6B6B/FFFFFF?text=Prize+1',
        },
        {
            [data.prizeConfigName]: '一等奖',
            [data.prizeConfigIsAll]: false,
            [data.prizeConfigCount]: 2,
            [data.prizeConfigDesc]: '一等奖描述',
            [data.prizeConfigImageUrl]: 'https://via.placeholder.com/200x200/4ECDC4/FFFFFF?text=Prize+2',
        },
        {
            [data.prizeConfigName]: '二等奖',
            [data.prizeConfigIsAll]: false,
            [data.prizeConfigCount]: 3,
            [data.prizeConfigDesc]: '二等奖描述',
            [data.prizeConfigImageUrl]: 'https://via.placeholder.com/200x200/45B7D1/FFFFFF?text=Prize+3',
        },
        {
            [data.prizeConfigName]: '三等奖',
            [data.prizeConfigIsAll]: false,
            [data.prizeConfigCount]: 5,
            [data.prizeConfigDesc]: '三等奖描述',
            [data.prizeConfigImageUrl]: 'https://via.placeholder.com/200x200/FFA07A/FFFFFF?text=Prize+4',
        },
        {
            [data.prizeConfigName]: '参与奖',
            [data.prizeConfigIsAll]: true,
            [data.prizeConfigCount]: 10,
            [data.prizeConfigDesc]: '参与奖描述',
            [data.prizeConfigImageUrl]: 'https://via.placeholder.com/200x200/98FB98/FFFFFF?text=Prize+5',
        },
    ]

    const ws = XLSX.utils.json_to_sheet(testData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '奖品列表')
    return wb
}

const dataEn = {
    prizeConfigName: 'Prize Name',
    prizeConfigIsAll: 'Full Participation',
    prizeConfigCount: 'Count',
    prizeConfigDesc: 'Description',
    prizeConfigImageUrl: 'Image URL',
}

const dataZhCn = {
    prizeConfigName: '奖品名称',
    prizeConfigIsAll: '可重复',
    prizeConfigCount: '抽奖人数',
    prizeConfigDesc: '描述',
    prizeConfigImageUrl: '图片URL',
}

const enWb = createTestPrizeData(dataEn)
XLSX.writeFile(enWb, 'public/prizeTestTemplate-en.xlsx')

const zhCnWb = createTestPrizeData(dataZhCn)
XLSX.writeFile(zhCnWb, 'public/奖品测试-zhCn.xlsx')

console.log('Test files created successfully:')
console.log('- public/prizeTestTemplate-en.xlsx')
console.log('- public/奖品测试-zhCn.xlsx')
