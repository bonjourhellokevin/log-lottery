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
                const imageUrl = item.imageUrl || item[Object.keys(item)[4]] || ''
                return {
                    id: String(Date.now() + index),
                    name: item.prizeName || item[Object.keys(item)[0]] || '',
                    sort: index + 1,
                    isAll: item.isAll === true || item[Object.keys(item)[1]] === true,
                    count: Number(item.count) || Number(item[Object.keys(item)[2]]) || 1,
                    isUsedCount: 0,
                    picture: {
                        id: imageUrl ? `url-${index}` : '',
                        name: imageUrl ? item.prizeName || item[Object.keys(item)[0]] || '' : '',
                        url: imageUrl,
                    },
                    separateCount: {
                        enable: false,
                        countList: [],
                    },
                    desc: item.desc || item[Object.keys(item)[3]] || '',
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
