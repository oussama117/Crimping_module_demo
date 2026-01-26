import { useEffect, useState } from 'react'
import { Languages, Results, TrialJoinCandidate } from '@/types'
import { ArrowBigDownDash, ArrowBigLeft, SearchIcon } from 'lucide-react'
import { Label } from '@renderer/components/ui/label'
import { Button } from '@renderer/components/ui/button'
import yazakiLogo from '../../assets/logo.png'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAppSettingsStore } from '@renderer/store/useAppSettingStore'
import apis from '../api/api'
import { CandidateTrialsTable } from './components/candidateTrialTable'
import { Input } from '@renderer/components/ui/input'
import * as XLSX from 'xlsx'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { Separator } from '@renderer/components/ui/separator'

export default function ScoreBoard(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { settings } = useAppSettingsStore()
  const [data, setData] = useState<TrialJoinCandidate[]>([])
  const [search, setSearch] = useState<string>('')
  const [includeInit, setIncludeInit] = useState<boolean>(false)
  // const tableRef = useRef(null)

  const handleExportExcel = () => {
    if (!data || data.length === 0) return

    // 1. Map the data to a clean format for Excel
    const excelRows = data
      .filter((trial) => {
        // If includeInit is true, we keep everything (return true)
        if (includeInit) return true

        // If includeInit is false, only keep items that ARE NOT 'init'
        return trial.result !== Results.init
      })
      .map((item) => ({
        // Updated keys with score_board prefix
        [t('score_board.table_header.candidate_name')]: item.candidate?.candidate_name || 'N/A',
        [t('score_board.table_header.serial_number')]: item.candidate?.serial_number || 'N/A',
        [t('score_board.table_header.level')]: item.level ? t(`trial_page.${item.level}`) : 'N/A',
        [t('score_board.table_header.classification')]: item.class
          ? t(`trial_page.class.${item.class}`)
          : 'N/A',
        [t('score_board.table_header.turns')]: item.turns_m === -1 ? 'N/A' : item.turns_m,
        [t('score_board.table_header.remaining_time')]:
          item.remaining_time === 0 ? 'N/A' : item.remaining_time,
        [t('score_board.table_header.result')]: item.result
          ? t(`score_board.table_header.${item.result}`)
          : 'N/A',
        [t('score_board.table_header.date')]: item.created_at
          ? new Date(item.created_at).toLocaleDateString()
          : '-'
      }))

    // 2. Generate Worksheet and Workbook
    const worksheet = XLSX.utils.json_to_sheet(excelRows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trials')

    // 3. Define Filename
    const dateStr = new Date().toISOString().split('T')[0]
    const fileName = `Yazaki_Didactic_6_Trials_${dateStr}.xlsx`

    // 4. Trigger Download
    XLSX.writeFile(workbook, fileName)
  }

  const handleRemoveFromList = (id: number) => {
    // This updates the DOM instantly by filtering the local array
    setData((prev) => prev.filter((t) => t.candidateId !== id))
  }

  useEffect(() => {
    apis.getAllTrialJoinCandidate().then((data) => {
      if (data.length === 0) {
        alert(`Failed to get candidates`)
        setData(data)
      } else {
        setData(data)
      }
    })
  }, [])
  // useEffect(() => {
  //   console.log('data Table: ', data)
  // }, [data])

  return (
    <>
      <section className="w-full h-screen flex flex-col">
        <div className="relative w-full h-[80px] flex bg-[#E5E5E5]">
          <div className="h-full flex-1 flex">
            <Button
              className="cursor-pointer hover:bg-gray-400 hover:text-white flex flex-col items-center justify-center bg-transparent text-gray-600 h-full w-[140px] rounded-none"
              onClick={() => {
                navigate('/')
              }}
            >
              <ArrowBigLeft />
              <Label className="cursor-pointer">{t('trial_page.return_button')}</Label>
            </Button>
          </div>
          <div className="h-full flex-1 flex items-center justify-center gap-4">
            <img className="h-[40%]" src={yazakiLogo} alt="yazaki_logo" />
            <div className="">
              <label
                className={`bg-black text-white font-bold px-[10px] py-[5px] ${settings.language === Languages.ar ? 'rounded-e-md' : 'rounded-s-md'}`}
              >
                {t('trial_page.title')}
              </label>
              <label
                className={`bg-red-600 text-white font-bold px-4 py-2 px-[10px] py-[5px] ${settings.language === Languages.ar ? 'rounded-s-md' : 'rounded-e-md'} `}
              >
                {settings.module_number}
              </label>
            </div>
          </div>
          <div className="h-full flex-1 flex justify-end"></div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-[85%] relative h-full flex flex-col p-8">
            <div className="w-max h-[80px] p-4 flex items-center justify-center gap-2 mx-auto">
              <Input
                type="search"
                className="w-[350px] m-auto"
                placeholder={t('settings_page.search')}
                onChange={(e) => {
                  setSearch(e.target.value)
                }}
              ></Input>
              <SearchIcon />
            </div>
            <div className="grow w-full h-full flex-1 relative overflow-hidden">
              <div className="absolute inset-0 flex overflow-y-auto">
                <ScrollArea className="w-full h-full">
                  <CandidateTrialsTable
                    onDelete={handleRemoveFromList}
                    trials={data.filter((trial) => {
                      return search === ''
                        ? trial
                        : Number.isNaN(Number(search))
                          ? trial?.candidate?.candidate_name
                              ?.toLowerCase()
                              .includes(search.toLowerCase())
                          : trial?.candidate?.serial_number?.toString().includes(search)
                    })}
                  />
                </ScrollArea>
              </div>
            </div>
          </div>
          <div className="flex-1 h-full p-4 flex flex-col gap-4 border-l">
            <label
              className={`text-xl font-bold w-full ${settings.language === Languages.ar ? 'text-right' : ''}`}
            >
              {t('score_board.table_header.actions')}
            </label>
            <Separator />
            <div className="flex flex-col gap-2">
              <Button
                className="w-full cursor-pointer"
                onClick={() => {
                  handleExportExcel()
                }}
              >
                <ArrowBigDownDash />
                <label className="cursor-pointer">{t('score_board.download_excel_button')}</label>
              </Button>
              <div className="flex gap-2 items-center">
                <Checkbox
                  checked={includeInit}
                  onCheckedChange={(checked) => {
                    setIncludeInit(!!checked) // Using !! ensures it stays a boolean
                  }}
                  id="include-init"
                  className="cursor-pointer"
                />
                <label
                  htmlFor="include-init"
                  className={`cursor-pointer flex-1 ${settings.language === Languages.ar ? 'text-right' : ''}`}
                >
                  {t('score_board.check_init')}
                </label>
              </div>
            </div>
            <Separator />
            <label
              className={`text-xl font-bold w-full ${settings.language === Languages.ar ? 'text-right' : ''}`}
            >
              {t('settings_page.trial_ref')}
            </label>
            <div className="w-full h-max flex flex-col gap-2 px-4">
              <div className="flex justify-between">
                <label
                  className={`font-bold text-md ${settings.language === Languages.ar ? 'hidden' : ''}`}
                >
                  {t('trial_page.time')}
                </label>
                <label className="font-bold text-md">{settings.trial_time}</label>
                <label
                  className={`font-bold text-md ${settings.language === Languages.ar ? '' : 'hidden'}`}
                >
                  {t('trial_page.time')}
                </label>
              </div>
              <Separator />
              <div className="flex justify-between">
                <label
                  className={`font-bold text-md ${settings.language === Languages.ar ? 'hidden' : ''}`}
                >
                  {t('settings_page.level_1_setting')}
                </label>
                <label className="font-bold text-md">{settings.level_1}</label>
                <label
                  className={`font-bold text-md ${settings.language === Languages.ar ? '' : 'hidden'}`}
                >
                  {t('settings_page.level_1_setting')}
                </label>
              </div>
              <Separator />
              <div className="flex justify-between">
                <label
                  className={`font-bold text-md ${settings.language === Languages.ar ? 'hidden' : ''}`}
                >
                  {t('settings_page.level_2_setting')}
                </label>
                <label className="font-bold text-md">{settings.level_2}</label>
                <label
                  className={`font-bold text-md ${settings.language === Languages.ar ? '' : 'hidden'}`}
                >
                  {t('settings_page.level_2_setting')}
                </label>
              </div>
              <Separator />
              <div className="flex justify-between">
                <label
                  className={`font-bold text-md ${settings.language === Languages.ar ? 'hidden' : ''}`}
                >
                  {t('settings_page.level_3_setting')}
                </label>
                <label className="font-bold text-md">{settings.level_3}</label>
                <label
                  className={`font-bold text-md ${settings.language === Languages.ar ? '' : 'hidden'}`}
                >
                  {t('settings_page.level_3_setting')}
                </label>
              </div>
              <Separator />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
