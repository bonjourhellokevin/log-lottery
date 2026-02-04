import type { Ref } from 'vue'
import type { IPrizeConfig } from '@/types/storeType'
import localforage from 'localforage'
import { cloneDeep } from 'lodash-es'
import { storeToRefs } from 'pinia'
import { inject, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toast-notification'
import * as XLSX from 'xlsx'
import { loadingKey } from '@/components/Loading'
import i18n from '@/locales/i18n'
import useStore from '@/store'
import { readFileBinary, readLocalFileAsArraybuffer } from '@/utils/file'
import ImportExcelWorker from './importExcel.worker?worker'

export function usePrizeConfig({ exportInputFileRef }: { exportInputFileRef?: Ref<HTMLInputElement | null> } = {}) {
    const toast = useToast()
    const imageDbStore = localforage.createInstance({
        name: 'imgStore',
    })
    const prizeConfig = useStore().prizeConfig
    const globalConfig = useStore().globalConfig
    const { getPrizeConfig: localPrizeList, getCurrentPrize: currentPrize } = storeToRefs(prizeConfig)

    const { getImageList: localImageList } = storeToRefs(globalConfig)
    const { t } = useI18n()
    const imgList = ref<any[]>([])

    const prizeList = ref(cloneDeep(localPrizeList.value))
    const selectedPrize = ref<IPrizeConfig | null>()

    const baseUrl = import.meta.env.BASE_URL.replace('./', '/')
    const worker: Worker | null = exportInputFileRef ? new ImportExcelWorker() : null
    const loading = inject(loadingKey)

    function selectPrize(item: IPrizeConfig) {
        selectedPrize.value = item
        selectedPrize.value.isUsedCount = 0
        selectedPrize.value.isUsed = false

        if (selectedPrize.value.separateCount.countList.length > 1) {
            return
        }
        selectedPrize.value.separateCount = {
            enable: true,
            countList: [
                {
                    id: '0',
                    count: item.count,
                    isUsedCount: 0,
                },
            ],
        }
    }

    function changePrizeStatus(item: IPrizeConfig) {
        item.isUsed ? item.isUsedCount = 0 : item.isUsedCount = item.count
        item.separateCount.countList = []
        item.isUsed = !item.isUsed
    }

    function changePrizePerson(item: IPrizeConfig) {
        let indexPrize = -1
        for (let i = 0; i < prizeList.value.length; i++) {
            if (prizeList.value[i].id === item.id) {
                indexPrize = i
                break
            }
        }
        if (indexPrize > -1) {
            prizeList.value[indexPrize].separateCount.countList = []
            prizeList.value[indexPrize].isUsed ? prizeList.value[indexPrize].isUsedCount = prizeList.value[indexPrize].count : prizeList.value[indexPrize].isUsedCount = 0
        }
    }
    function submitData(value: any) {
        selectedPrize.value!.separateCount.countList = value
        selectedPrize.value = null
    }

    async function getImageDbStore() {
        const keys = await imageDbStore.keys()
        if (keys.length > 0) {
            imageDbStore.iterate((value, key) => {
                imgList.value.push({
                    key,
                    value,
                })
            })
        }
    }

    function delItem(item: IPrizeConfig) {
        prizeConfig.deletePrizeConfig(item.id)
        toast.success(i18n.global.t('error.deleteSuccess'))
    }
    function addPrize() {
        const defaultPrizeCOnfig: IPrizeConfig = {
            id: new Date().getTime().toString(),
            name: i18n.global.t('table.prizeName'),
            sort: 0,
            isAll: false,
            count: 1,
            isUsedCount: 0,
            picture: {
                id: '',
                name: '',
                url: '',
            },
            separateCount: {
                enable: false,
                countList: [],
            },
            desc: '',
            isShow: true,
            isUsed: false,
            frequency: 1,
        }
        prizeList.value.push(defaultPrizeCOnfig)
        toast.success(i18n.global.t('error.success'))
    }
    function resetDefault() {
        prizeConfig.resetDefault()
        prizeList.value = cloneDeep(localPrizeList.value)
        toast.success(i18n.global.t('error.success'))
    }
    async function delAll() {
        prizeList.value = []
        toast.success(i18n.global.t('error.success'))
    }

    async function getExcelTemplateContent() {
        const locale = i18n.global.locale.value
        if (locale === 'zhCn') {
            const templateData = await readLocalFileAsArraybuffer(`${baseUrl}奖品设置-zhCn.xlsx`)
            return templateData
        }
        else {
            const templateData = await readLocalFileAsArraybuffer(`${baseUrl}prizeListTemplate-en.xlsx`)
            return templateData
        }
    }

    function sendWorkerMessage(message: any) {
        if (worker) {
            worker.postMessage(message)
        }
    }

    async function startWorker(data: string) {
        loading?.show()
        getExcelTemplateContent()
        sendWorkerMessage({ type: 'start', data, templateData: await getExcelTemplateContent() })
    }

    async function handleFileChange(e: Event) {
        if (worker) {
            worker.onmessage = (e) => {
                if (e.data.type === 'done') {
                    prizeList.value = e.data.data
                    toast.open({
                        message: t('error.importSuccess'),
                        type: 'success',
                        position: 'top-right',
                    })
                    clearFileInput()
                }
                if (e.data.type === 'error') {
                    if (e.data.message === 'not right template') {
                        toast.open({
                            message: t('error.excelFileError'),
                            type: 'error',
                            position: 'top-right',
                        })
                        return
                    }
                    toast.open({
                        message: e.data.message || t('error.importFail'),
                        type: 'error',
                        position: 'top-right',
                    })
                }
                loading?.hide()
            }
        }
        const dataBinary = await readFileBinary(((e.target as HTMLInputElement).files as FileList)[0]!)
        startWorker(dataBinary)
    }

    function clearFileInput() {
        if (exportInputFileRef && exportInputFileRef.value) {
            exportInputFileRef.value.value = ''
        }
    }

    function downloadTemplate() {
        const templateFileName = i18n.global.t('data.prizeXlsxName')
        const fileUrl = `${baseUrl}${templateFileName}`
        fetch(fileUrl)
            .then(res => res.blob())
            .then((blob) => {
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = templateFileName
                a.click()
                toast.open({
                    message: t('error.downloadSuccess'),
                    type: 'success',
                    position: 'top-right',
                })
            })
    }

    function exportData() {
        let data = JSON.parse(JSON.stringify(prizeList.value))
        for (let i = 0; i < data.length; i++) {
            delete data[i].id
            delete data[i].sort
            delete data[i].isUsedCount
            delete data[i].picture
            delete data[i].separateCount
            delete data[i].isShow
            delete data[i].frequency
            data[i].isAll = data[i].isAll ? i18n.global.t('data.yes') : i18n.global.t('data.no')
            data[i].imageUrl = prizeList.value[i].picture.url || ''
        }
        let dataString = JSON.stringify(data)
        dataString = dataString
            .replaceAll(/name/g, i18n.global.t('data.prizeConfigName'))
            .replaceAll(/isAll/g, i18n.global.t('data.prizeConfigIsAll'))
            .replaceAll(/count/g, i18n.global.t('data.prizeConfigCount'))
            .replaceAll(/desc/g, i18n.global.t('data.prizeConfigDesc'))
            .replaceAll(/imageUrl/g, i18n.global.t('data.prizeConfigImageUrl'))

        data = JSON.parse(dataString)

        if (data.length > 0) {
            const dataBinary = XLSX.utils.json_to_sheet(data)
            const dataBinaryBinary = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(dataBinaryBinary, dataBinary, 'Sheet1')
            XLSX.writeFile(dataBinaryBinary, 'prizeData.xlsx')
            toast.open({
                message: t('error.exportSuccess'),
                type: 'success',
                position: 'top-right',
            })
        }
        else {
            toast.open({
                message: t('table.noneData'),
                type: 'error',
                position: 'top-right',
            })
        }
    }

    onMounted(() => {
        getImageDbStore()
    })
    watch(() => prizeList.value, (val: IPrizeConfig[]) => {
        prizeConfig.setPrizeConfig(val)
    }, { deep: true })

    return {
        addPrize,
        resetDefault,
        delAll,
        delItem,
        prizeList,
        currentPrize,
        selectedPrize,
        submitData,
        changePrizePerson,
        changePrizeStatus,
        selectPrize,
        localImageList,
        handleFileChange,
        downloadTemplate,
        exportData,
    }
}
