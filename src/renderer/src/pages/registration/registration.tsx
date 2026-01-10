import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Asterisk, ChartColumnIcon, Cog, Play, User } from 'lucide-react'
import { Label } from '../../components/ui/label'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import i18n from '@renderer/i18n/config'
import yazaki_logo from '../../assets/logo.png'
import bg from '../../assets/yazaki_bg_gray.jpg'
import { useNavigate } from 'react-router-dom'

export default function RegistrationPage(): React.JSX.Element {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [reg_number, setRegNumber] = useState('')
  const [validReg, setValid] = useState('empty')
  const [validName, setValidName] = useState('empty')
  const navigate = useNavigate()

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*$/.test(value) && value.length <= 5) {
      setValid('valid')
      setRegNumber(value)
    } else if (value === '') {
      setValid('empty')
    } else {
      setValid('invalid')
    }
  }
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      setValidName('empty')
    } else {
      setValidName('valid')
      setName(value)
    }
  }
  return (
    <>
      <div className="relative flex flex-col min-h-screen min-w-screen text-black  items-center justify-center">
        <img className="absolute w-full z-[-13] m-auto" src={bg} alt="yazaki background" />
        <section className="w-[45%] h-max flex flex-col items-center gap-4 mb-8">
          <div className="w-full h-[6rem] flex items-center mb-8 border border-gray-400">
            <div className=" flex-1 p-6  flex items-center justify-center">
              <img className="h-full" src={yazaki_logo} alt="yazaki logo" />
            </div>
            <div className="flex-1 p-6 border-l border-gray-400 flex items-center justify-center">
              <label className="text-5xl font-black m-auto">{t('registration_page.title')} 6</label>
            </div>
          </div>
          {/* content */}
          <div className="w-[60%] border border-gray-400 flex flex-col flex-1 items-center justify-center gap-6">
            <div className="flex flex-col w-full p-6">
              <div
                className={`"z-[200] bg-[#E5E5E5] box-border h-max w-full flex items-center border focus-within:border-gray-400 `}
              >
                <div className="h-[70px] w-[70px] flex items-center justify-center">
                  <Asterisk className="h-[30px] w-[30px] opacity-[50%]" />
                </div>

                <div
                  className={`h-[70px] flex-1 flex flex-col ${validReg === 'valid' || validReg === 'empty' ? 'bg-white' : 'bg-red-200'}`}
                >
                  <label className="ml-4 text-[10px] font-bold p-[2px] opacity-[50%]">
                    {t('registration_page.number')}
                    <span
                      className={`text-red-600  ${validReg === 'empty' || validReg === 'valid' ? 'hidden' : 'inline'}`}
                    >
                      {' '}
                      - {t('registration_page.number_error')}
                    </span>
                  </label>
                  <input
                    className="pl-4 border-none flex-1 outline-none bg-transparent text-xl"
                    type="text"
                    id="name"
                    onChange={handleRegChange}
                  />
                </div>
              </div>
              <div className="z-[200] bg-[#E5E5E5] box-border  h-max w-full flex items-center border border-[#E5E5E5] focus-within:border-gray-400">
                <div className="h-[70px] w-[70px] flex items-center justify-center">
                  <User className="h-[30px] w-[30px] opacity-[50%]" />
                </div>

                <div
                  className={`h-[70px] flex-1 flex flex-col ${validName === 'valid' || validName === 'empty' ? 'bg-white' : 'bg-red-200'}`}
                >
                  <label className="ml-4 text-[10px] font-bold p-[2px] opacity-[50%]">
                    {t('registration_page.name')}
                    <span
                      className={`text-red-600  ${validName === 'empty' || validName === 'valid' ? 'hidden' : 'inline'}`}
                    >
                      {' '}
                      - {t('registration_page.name_error')}
                    </span>
                  </label>
                  <input
                    className="pl-4 border-none flex-1 outline-none bg-transparent text-xl"
                    type="text"
                    id="name"
                    onChange={handleNameChange}
                  />
                </div>
              </div>
              <Button
                className="h-[70px] bg-[#DA5949] hover:bg-[#D88D87] cursor-pointer w-full rounded-none text-xl"
                // disabled={validReg !== 'valid' || validName !== 'valid'}
                onClick={() => {
                  if (validReg === 'empty' || validName === 'empty') {
                    setValidName('invalid')
                    setValid('invalid')
                    return
                  }
                  ;(window as any).api.addTrail(name, parseInt(reg_number))

                  navigate('/settings')
                }}
              >
                <Play className="h-[50px] w-[50px] min-w-[25px] min-h-[25px]" />
                {t('registration_page.start_button')}
              </Button>
            </div>
            <div className="flex w-full p-6 border-t border-gray-400">
              <Button
                className=" h-[90px] w-[140px] bg-[#D6D6D6] hover:bg-[#E5E5E5] cursor-pointer rounded-none flex flex-col items-center justify-center gap-2 text-xl text-black"
                onClick={() => {}}
              >
                <Cog className="h-[50px] w-[50px] min-w-[25px] min-h-[25px]" />
                <Label> {t('registration_page.settings_button')} </Label>
              </Button>
              <Button
                className="flex-1 h-[90px] border bg-[#D6D6D6] hover:bg-[#E5E5E5] cursor-pointer rounded-none flex flex-col items-center justify-center gap-2 text-xl text-black"
                onClick={() => {}}
              >
                <ChartColumnIcon className="h-[50px] w-[50px] min-w-[25px] min-h-[25px]" />
                <Label> {t('registration_page.score_button')} </Label>
              </Button>
            </div>
          </div>
        </section>
        <div className="absolute top-4 right-4 text-black">
          <Select
            onValueChange={(value) => {
              i18n.changeLanguage(value)
            }}
            defaultValue={i18n.language}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français 'fr'</SelectItem>
              <SelectItem value="en">English 'en'</SelectItem>
              <SelectItem value="ar">العربية 'ar'</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )
}
