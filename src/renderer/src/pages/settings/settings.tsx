import { Button } from '@renderer/components/ui/button'
import { Label } from '@renderer/components/ui/label'
import {
  ArrowBigLeft,
  CircleX,
  Clock,
  Info,
  LanguagesIcon,
  RefreshCcwDot,
  RotateCcw,
  Save
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import yazakiLogo from '../../assets/logo.png'
import { useAppSettingsStore } from '@renderer/store/useAppSettingStore'
import { Languages } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import apis from '../api/api'
import { toast } from 'sonner'
import { Input } from '@renderer/components/ui/input'
import { useEffect, useState } from 'react'
import i18n from '@renderer/i18n/config'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'

export default function Settings(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  // const location = useLocation()
  // const origin = location.state?.from || 'direct-access'
  console.log('User came from:', origin)
  const { settings, setAppSettings } = useAppSettingsStore()
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  useEffect(() => {
    // Check if language exists to avoid issues on first load
    if (settings.language) {
      i18n.changeLanguage(settings.language)
    }
  }, [settings.language])

  return (
    <>
      <section className="w-full h-screen flex flex-col">
        <Dialog open={openConfirmDialog} onOpenChange={setOpenConfirmDialog}>
          <DialogContent className="p-0 z-[101] h-[250px] w-[400px] min-w-[400px] overflow-hidden">
            <DialogHeader className="hidden">
              <DialogTitle>Progress</DialogTitle>
              <DialogDescription>This is a dialog for saving and resetting.</DialogDescription>
            </DialogHeader>
            <div className="w-full h-full flex flex-col items-center  p-4">
              <div className="flex-1 flex flex-col gap-4 items-center justify-center">
                <Info className="min-w-[50px] min-h-[50px]" />
                <label className="text-lg font-bold text-center">
                  {t('settings_page.confirm_message')}
                </label>
              </div>
              <div className="h-max w-full flex gap-4 justify-end">
                <Button
                  className="cursor-pointer"
                  onClick={() => {
                    setOpenConfirmDialog(false)
                  }}
                  variant="destructive"
                >
                  <CircleX />
                  <label className="cursor-pointer">{t('settings_page.cancel_button')}</label>
                </Button>
                <Button
                  className="cursor-pointer"
                  onClick={() => {
                    apis.updateSettings({ ...settings }).then((data) => {
                      // console.log('setting update result: ', data)
                      if (data.success) {
                        setOpenConfirmDialog(false)
                      } else {
                        alert(`Failed to change settings err: ${data.error}`)
                      }
                    })
                  }}
                >
                  <Save />
                  <label className="cursor-pointer">{t('settings_page.confirm_button')}</label>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <div className="relative w-full h-[80px] flex bg-[#E5E5E5]">
          <div className="h-full flex-1 flex">
            <Button
              className="cursor-pointer hover:bg-gray-400 hover:text-white flex flex-col items-center justify-center bg-transparent text-gray-600 h-full w-[140px] rounded-none"
              onClick={() => {
                navigate('/')
              }}
            >
              <ArrowBigLeft />
              <Label className="cursor-pointer">{t('trail_page.return_button')}</Label>
            </Button>
          </div>
          <div className="h-full flex-1 flex items-center justify-center gap-4">
            <img className="h-[40%]" src={yazakiLogo} alt="yazaki_logo" />
            <div className="">
              <label
                className={`bg-black text-white font-bold px-[10px] py-[5px] ${settings.language === Languages.ar ? 'rounded-e-md' : 'rounded-s-md'}`}
              >
                {t('trail_page.title')}
              </label>
              <label
                className={`bg-red-600 text-white font-bold px-4 py-2 px-[10px] py-[5px] ${settings.language === Languages.ar ? 'rounded-s-md' : 'rounded-e-md'} `}
              >
                6
              </label>
            </div>
          </div>
          <div className="h-full flex-1 flex justify-end"></div>
        </div>
        <div className="relative flex-1 flex items-center justify-center">
          <div className="flex-1 h-full"></div>
          <div className="w-[50%] h-full flex flex-col p-4 gap-4">
            <label
              className={`text-black text-4xl font-bold ${settings.language === Languages.ar ? 'text-right' : ''}`}
            >
              {t('settings_page.title')}
            </label>
            <p className={`text-sm ${settings.language === Languages.ar ? 'text-right' : ''}`}>
              {t('settings_page.settings_page_info')}
            </p>
            <div className="w-full flex items-center justify-between bg-white p-4 rounded-xl border border-gray-400 shadow-md">
              {settings.language != Languages.ar ? (
                <div className="flex gap-2">
                  <LanguagesIcon />
                  <div className={`flex flex-col`}>
                    <label className={`text-lg font-bold `}>
                      {t('settings_page.language_setting')}
                    </label>
                    <p className="text-xs text-gray-400">
                      {t('settings_page.trial_time_setting_info')}
                    </p>
                  </div>
                </div>
              ) : (
                ''
              )}
              <Select
                onValueChange={(value) => {
                  setAppSettings({
                    ...settings,
                    language:
                      value === Languages.fr
                        ? Languages.fr
                        : value === Languages.en
                          ? Languages.en
                          : Languages.ar
                  })
                  apis
                    .updateLangauge(
                      value === Languages.fr
                        ? Languages.fr
                        : value === Languages.en
                          ? Languages.en
                          : Languages.ar
                    )
                    .then((data) => {
                      // console.log('language change: ', data)
                      if (data.success === true) {
                        toast.info(`Language was successfully changed to ${settings.language}`)
                      } else {
                        alert(`Failed to change language err: ${data.error}`)
                      }
                    })
                }}
                value={settings.language || Languages.fr}
              >
                <SelectTrigger className="w-[20%]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français 'fr'</SelectItem>
                  <SelectItem value="en">English 'en'</SelectItem>
                  <SelectItem value="ar">العربية 'ar'</SelectItem>
                </SelectContent>
              </Select>
              {settings.language === Languages.ar ? (
                <>
                  <div className="flex gap-2 items-center">
                    <div className={`flex flex-col items-end`}>
                      <label className={`text-lg font-bold `}>
                        {t('settings_page.language_setting')}
                      </label>
                      <p className="text-xs text-gray-400">
                        {t('settings_page.trial_time_setting_info')}
                      </p>
                    </div>
                    <LanguagesIcon />
                  </div>
                </>
              ) : (
                ''
              )}
            </div>
            <div className="w-full flex items-center justify-between bg-white p-4 rounded-xl border border-gray-400 shadow-md">
              {settings.language != Languages.ar ? (
                <div className="flex gap-2 items-center">
                  <Clock />
                  <div className={`w-max flex flex-col`}>
                    <label className="text-lg font-bold w-max">
                      {t('settings_page.trial_time_setting')}
                    </label>
                    <p className={`text-xs text-gray-400 w-max`}>
                      {t('settings_page.trial_time_setting_info')}
                    </p>
                  </div>
                </div>
              ) : (
                ''
              )}
              <Input
                type="number"
                className="w-[20%]"
                placeholder={t('settings_page.trial_time_placeholder')}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : Number(e.target.value)
                  setAppSettings({ ...settings, trail_time: val })
                }}
              ></Input>
              {settings.language === Languages.ar ? (
                <div className="flex gap-2 items-center">
                  <div className={`w-max flex flex-col items-end`}>
                    <label className="text-lg font-bold w-max">
                      {t('settings_page.trial_time_setting')}
                    </label>
                    <p className={`text-xs text-gray-400 w-max`}>
                      {t('settings_page.trial_time_setting_info')}
                    </p>
                  </div>
                  <Clock />
                </div>
              ) : (
                ''
              )}
            </div>
            <label
              className={`w-full text-black text-2xl leading-none ${settings.language === Languages.ar ? 'text-right' : ''}`}
            >
              {t('settings_page.levels_title')}
            </label>
            <p
              className={`w-full text-xs text-gray-400 ${settings.language === Languages.ar ? 'text-right' : ''}`}
            >
              {t('settings_page.levels_setting_info')}
            </p>
            <div className="w-full flex items-center justify-between bg-white p-4 rounded-xl border border-gray-400 shadow-md">
              {settings.language != Languages.ar ? (
                <div className="flex gap-2 items-center">
                  <RefreshCcwDot />
                  <div className={`w-max flex flex-col`}>
                    <label className="text-lg font-bold w-max">
                      {t('settings_page.level_1_setting')}
                    </label>
                  </div>
                </div>
              ) : (
                ''
              )}
              <Input
                type="number"
                className="w-[20%]"
                placeholder={t('settings_page.level_1_placeholder')}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : Number(e.target.value)
                  setAppSettings({ ...settings, level_1: val })
                }}
              ></Input>
              {settings.language === Languages.ar ? (
                <div className="flex gap-2 items-center">
                  <div className={`w-max flex flex-col items-end`}>
                    <label className="text-lg font-bold w-max">
                      {t('settings_page.level_1_setting')}
                    </label>
                  </div>
                  <RefreshCcwDot />
                </div>
              ) : (
                ''
              )}
            </div>
            <div className="w-full flex items-center justify-between bg-white p-4 rounded-xl border border-gray-400 shadow-md">
              {settings.language != Languages.ar ? (
                <div className="flex gap-2 items-center">
                  <RefreshCcwDot />
                  <div className={`w-max flex flex-col`}>
                    <label className="text-lg font-bold w-max">
                      {t('settings_page.level_2_setting')}
                    </label>
                  </div>
                </div>
              ) : (
                ''
              )}
              <Input
                type="number"
                className="w-[20%]"
                placeholder={t('settings_page.level_2_placeholder')}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : Number(e.target.value)
                  setAppSettings({ ...settings, level_2: val })
                }}
              ></Input>
              {settings.language === Languages.ar ? (
                <div className="flex gap-2 items-center">
                  <div className={`w-max flex flex-col items-end`}>
                    <label className="text-lg font-bold w-max">
                      {t('settings_page.level_2_setting')}
                    </label>
                  </div>
                  <RefreshCcwDot />
                </div>
              ) : (
                ''
              )}
            </div>
            <div className="w-full flex items-center justify-between bg-white p-4 rounded-xl border border-gray-400 shadow-md">
              {settings.language != Languages.ar ? (
                <div className="flex gap-2 items-center">
                  <RefreshCcwDot />
                  <div className={`w-max flex flex-col`}>
                    <label className="text-lg font-bold w-max">
                      {t('settings_page.level_3_setting')}
                    </label>
                  </div>
                </div>
              ) : (
                ''
              )}
              <Input
                type="number"
                className="w-[20%]"
                placeholder={t('settings_page.level_3_placeholder')}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : Number(e.target.value)
                  setAppSettings({ ...settings, level_3: val })
                }}
              ></Input>
              {settings.language === Languages.ar ? (
                <div className="flex gap-2 items-center">
                  <div className={`w-max flex flex-col items-end`}>
                    <label className="text-lg font-bold w-max">
                      {t('settings_page.level_3_setting')}
                    </label>
                  </div>
                  <RefreshCcwDot />
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
          <div className="flex-1 h-full p-4">
            <ul className={`mt-[75px] ${settings.language === Languages.ar ? 'text-right' : ''}`}>
              <li className="py-2 px-6 text-lg text-gray-600">
                <span className={`font-bold ${settings.language === Languages.ar ? '' : 'hidden'}`}>
                  {settings.language}
                </span>
                {t('settings_page.language_setting')}
                <span className={`font-bold ${settings.language != Languages.ar ? '' : 'hidden'}`}>
                  {settings.language}
                </span>
              </li>
              <li className="py-2 px-6 text-lg text-gray-600">
                {t('settings_page.trial_time_setting')}:{' '}
                <span className="font-bold">{settings.trail_time}</span>
              </li>
              <li className="py-2 px-6 text-lg text-gray-600">
                {t('settings_page.levels_title')}
                <ul>
                  <li className="py-2 px-6 text-lg text-gray-600">
                    {t('settings_page.level_1_setting')}:{' '}
                    <span className="font-bold">{settings.level_1}</span>
                  </li>
                  <li className="py-2 px-6 text-lg text-gray-600">
                    {t('settings_page.level_2_setting')}:{' '}
                    <span className="font-bold">{settings.level_2}</span>
                  </li>
                  <li className="py-2 px-6 text-lg text-gray-600">
                    {t('settings_page.level_3_setting')}:{' '}
                    <span className="font-bold">{settings.level_3}</span>
                  </li>
                </ul>{' '}
              </li>
            </ul>
          </div>
        </div>
        <div className="w-[50%] mx-auto flex gap-2 justify-end py-6">
          <Button
            variant="destructive"
            onClick={() => {
              setAppSettings({
                ...settings,
                trail_time: 60,
                level_1: 60,
                level_2: 90,
                level_3: 110
              })
            }}
            className="cursor-pointer"
          >
            <RotateCcw />
            <label className="cursor-pointer">{t('settings_page.default_button')}</label>
          </Button>
          <Button
            onClick={() => {
              // console.log('app settings: ', settings)
              setOpenConfirmDialog(true)
            }}
            className="cursor-pointer"
          >
            <Save />
            <label className="cursor-pointer">{t('settings_page.save_button')}</label>
          </Button>
        </div>
      </section>
    </>
  )
}
