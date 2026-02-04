import * as XLSX from 'xlsx'

interface WorkerMessage {
    type: 'start' | 'stop' | 'reset'
    data: any
    templateData: any
}

let allData: any[] = []

function headersEqual(template: string[], actual: string[]): boolean {
    return template.length >= actual.length
      && actual.some(item => template.includes(item))
}

globalThis.onmessage = async (e: MessageEvent<WorkerMessage>) => {
    switch (e.data.type) {
        case 'start':
        {
            const fileData = e.data.data
            const templateData = e.data.templateData

            const workBook = XLSX.read(fileData, { type: 'binary', cellDates: true })
            const workSheet = workBook.Sheets[workBook.SheetNames[0]]
            const excelData: object[] = XLSX.utils.sheet_to_json(workSheet)

            const templateWorkBook = XLSX.read(templateData, { type: 'array', cellDates: true })
            const templateWorkSheet = templateWorkBook.Sheets[templateWorkBook.SheetNames[0]]
            const templateExcelData: object[] = XLSX.utils.sheet_to_json(templateWorkSheet)

            const templateHeader = Object.keys(templateExcelData[0])
            const header = Object.keys(excelData[0])

            if (!headersEqual(templateHeader, header)) {
                globalThis.postMessage({
                    type: 'error',
                    data: null,
                    message: 'not right template',
                })
                return
            }

            allData = excelData.map((item: any, index: number) => {
                const keys = Object.keys(item)
                let imageUrl = ''
                let prizeName = ''
                let isAll = false
                let count = 1
                let desc = ''

                for (const key of keys) {
                    const lowerKey = key.toLowerCase()
                    if (lowerKey === 'image' || lowerKey === 'imageurl' || lowerKey === 'image url' || key.includes('图片URL') || key.includes('图片')) {
                        imageUrl = item[key]
                    }
                    else if (lowerKey === 'prizename' || lowerKey === 'name' || key.includes('奖品名称') || key.includes('名称')) {
                        prizeName = item[key]
                    }
                    else if (lowerKey === 'isall' || lowerKey === 'full participation' || key.includes('可重复')) {
                        isAll = item[key] === true || item[key] === 'Yes' || item[key] === '是'
                    }
                    else if (lowerKey === 'count' || key.includes('抽奖人数') || key.includes('人数')) {
                        count = Number(item[key]) || 1
                    }
                    else if (lowerKey === 'desc' || lowerKey === 'description' || key.includes('描述')) {
                        desc = item[key]
                    }
                }

                return {
                    id: String(Date.now() + index),
                    name: prizeName || keys[0] || '',
                    sort: index + 1,
                    isAll,
                    count,
                    isUsedCount: 0,
                    picture: {
                        id: imageUrl ? `url-${index}` : '',
                        name: imageUrl ? prizeName || '' : '',
                        url: imageUrl,
                    },
                    separateCount: {
                        enable: false,
                        countList: [],
                    },
                    desc,
                    isShow: true,
                    isUsed: false,
                    frequency: 1,
                }
            })

            globalThis.postMessage({
                type: 'done',
                data: allData,
                message: '读取完成',
            })
            break
        }
        default:
            globalThis.postMessage({
                type: 'fail',
                data: null,
                message: '读取失败',
            })
            break
    }
}
