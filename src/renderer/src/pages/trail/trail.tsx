import { Button } from '@renderer/components/ui/button'
import { Label } from '@renderer/components/ui/label'
import { ArrowBigLeft, CircleUser, Cog, Pause, Play, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import yazakiLogo from '../../assets/logo.png'
import { useEffect, useState } from 'react'
import { useCandidateStore } from '@renderer/store/useCandidateStore'
import { CandidateRow, Classifications, Languages, Levels, Results, TrailRow } from '@/types'
import { useTrailStore } from '@renderer/store/useTrailStore'
import { useAppSettingsStore } from '@renderer/store/useAppSettingStore'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import apis from '../api/api'

export default function Trail(): React.JSX.Element {
  // DECLARATIONS

  const { t } = useTranslation()
  const navigate = useNavigate()
  const [level_1, setLevel_1] = useState(false)
  const [level_2, setLevel_2] = useState(false)
  const [level_3, setLevel_3] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const itemWidth = 120 // The width of each label
  const scale = 1.25 // Scale factor for the center item
  const font_size = 60 // Scale factor for the center item
  const { candidate, setCandidate } = useCandidateStore()
  const { trail, setTrail } = useTrailStore()
  const { settings } = useAppSettingsStore()
  const numbers = Array.from({ length: settings.level_3 ? settings.level_3 + 1 : 111 }, (_, i) => i)

  const [countdown, setCountdown] = useState(5)
  const [seconds, setSeconds] = useState(settings.trail_time ? settings.trail_time : 60)
  const [isCountdownActive, setisCountdownActive] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [trailResults, setTrailResults] = useState<Partial<TrailRow>>()
  const [arduinoData, setArduinoData] = useState<any>()

  const strokeWidth = 20 // Adjust thickness here
  const radius = 190 - strokeWidth
  const circumference = 2 * Math.PI * radius
  const progress = seconds / 60
  const dashOffset = circumference - progress * circumference
  const svgCentre = (itemWidth * 3) / 2

  // HANDLERS =========================================

  const getStrokeColor = () => {
    if (seconds <= 5) return '#ef4444' // red-500
    if (seconds <= 15) return '#f97316' // orange-500
    return '#22c55e' // green-500
  }

  const handleSend = async (status: string) => {
    const success = await window.hardware.sendCommand(status)
    if (!success) {
      alert('Failed to send: Arduino might be disconnected!')
    }
  }

  const handleScroll = () => {
    setCurrentIndex((prev) => (prev + 1) % numbers.length)
  }

  const handelReset = () => {
    handleSend('0000')
    setCurrentIndex(0)
    setLevel_1(false)
    setLevel_2(false)
    setLevel_3(false)
    setCountdown(5)
    setIsActive(false)
    setisCountdownActive(false)
    if (settings.trail_time) {
      setSeconds(settings.trail_time)
    }
  }

  const handleOpenDialog = () => {
    openDialog ? setOpenDialog(false) : setOpenDialog(true)
  }

  // USEEFFECTS ==================================================

  useEffect(() => {
    const l1 = settings.level_1 != null && currentIndex >= settings.level_1
    const l2 = settings.level_2 != null && currentIndex >= settings.level_2
    const l3 = settings.level_3 != null && currentIndex >= settings.level_3

    setLevel_1(l1)
    setLevel_2(l2)
    setLevel_3(l3)

    if (l3) handleSend('1111')
    else if (l2) handleSend('1110')
    else if (l1) handleSend('1100')
    else handleSend('1000')
  }, [currentIndex, settings])

  useEffect(() => {
    console.log('candidate from trail: ', candidate)
    console.log('trail from trail: ', trail)
  }, [trail])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isCountdownActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIsActive(true)
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isCountdownActive, settings.trail_time])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, settings.trail_time])

  useEffect(() => {
    if (seconds !== 0) return

    let trailLevel = Levels.level_init
    if (level_3) trailLevel = Levels.level_3
    else if (level_2) trailLevel = Levels.level_2
    else if (level_1) trailLevel = Levels.level_1

    const classMap = {
      [Levels.level_1]: Classifications.beginner,
      [Levels.level_2]: Classifications.intermediate,
      [Levels.level_3]: Classifications.advanced,
      [Levels.level_init]: Classifications.class_init
    }

    const trailClass = classMap[trailLevel as keyof typeof classMap]

    const trailResult = trailLevel !== Levels.level_init ? Results.success : Results.failure

    const trailInstance: Partial<TrailRow> = {
      id: trail.id,
      candidate_id: trail.candidate_id,
      turns_m: currentIndex,
      level: trailLevel,
      result: trailResult,
      class: trailClass
    }

    setTrailResults(trailInstance)
    setTrail({ ...trailInstance } as TrailRow)
    apis.updateTrail({ ...trailInstance } as TrailRow).then((data) => {
      console.log('trail save: ', data)
    })
    setOpenDialog(true)
    console.log('Trail complete:', trailInstance)
  }, [seconds, level_1, level_2, level_3, currentIndex])

  useEffect(() => {
    const cleanup = window.hardware.onData((data) => {
      // console.log('Arduino message in UI:', data)
      handleScroll()
      setArduinoData(data)
    })

    return () => cleanup()
  }, [])

  return (
    <>
      <section className="w-full h-screen flex flex-col">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="p-0 z-[101] h-[60%] w-[900px] min-w-[900px] overflow-hidden">
            <DialogHeader className="hidden">
              <DialogTitle>Progress</DialogTitle>
              <DialogDescription>This is a dialog for saving and resetting.</DialogDescription>
            </DialogHeader>
            <div className="w-full h-full flex">
              <div className="w-[300px] bg-gray-400 flex flex-col gap-6 items-center justify-center p-4">
                <label className="text-6xl font-black text-center">Time's up!</label>
                <label
                  className={`text-4xl font-bold text-center p-2 rounded-xl bg-white ${trailResults?.result === Results.success ? 'text-green-400' : 'text-red-400'}`}
                >
                  {trailResults?.result}
                </label>
                <p className="text-center text-gray-600">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis nam vero
                  accusamus minus quam dignissimos eius
                </p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-between">
                <label>Progress</label>
                <div className=" flex flex-col gap-2 items-center px-4">
                  <label className="text-center text-[40px] font-black">
                    {trailResults?.level}
                  </label>
                  <div className="flex w-max leading-none">
                    <label className="text-center text-[120px] font-black">
                      {trailResults?.turns_m}
                      <span className="text-[40px]">t</span>
                    </label>
                    <label className="text-center text-[120px]">/</label>

                    <label className="text-center text-[120px] font-black">
                      {settings.trail_time}
                      <span className="text-[40px]">s</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <div
                      className={`h-[20px] w-[20px] rounded-full ${
                        trailResults?.level === Levels.level_1
                          ? 'bg-yellow-400'
                          : trailResults?.level === Levels.level_2
                            ? 'bg-orange-400'
                            : trailResults?.level === Levels.level_3
                              ? 'bg-green-400'
                              : 'bg-black'
                      }`}
                    ></div>
                    <label className="text-center text-[40px] font-black">
                      {trailResults?.level === Levels.level_1
                        ? 'Beginner'
                        : trailResults?.level === Levels.level_2
                          ? 'Intermediate'
                          : trailResults?.level === Levels.level_3
                            ? 'Advanced'
                            : 'class_init'}
                    </label>
                  </div>
                  <p className="text-center text-gray-600">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis nam vero
                    accusamus minus quam dignissimos eius
                  </p>
                </div>
                <div className="w-full flex justify-end">
                  <div className="h-[60px] w-full flex">
                    <Button className="min-h-full flex-1 rounded-none bg-gray-200 hover:bg-gray-400 text-black">
                      Retry
                    </Button>
                    <Button variant="destructive" className="min-h-full flex-1 rounded-none">
                      Exit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <div className="relative w-full h-[80px] flex bg-[#E5E5E5]">
          <div className="h-full flex-1 flex">
            <Button
              className="cursor-pointer hover:bg-gray-400 hover:text-white flex flex-col items-center justify-center bg-transparent text-gray-600 h-full w-[140px] rounded-none"
              onClick={() => {
                handelReset()
                setCandidate({
                  id: null,
                  candidate_name: null,
                  serial_number: null
                } as CandidateRow)
                setTrail({
                  id: null,
                  candidate_id: null,
                  turns_m: null,
                  result: null,
                  level: null,
                  class: null
                })
                navigate('/')
              }}
            >
              <ArrowBigLeft />
              <Label className="cursor-pointer">{t('trail_page.return_button')}</Label>
            </Button>
            <Button
              className="cursor-pointer hover:bg-gray-400 hover:text-white flex flex-col items-center justify-center bg-transparent text-gray-600 h-full w-[140px] rounded-none"
              onClick={() => handelReset()}
            >
              <RotateCcw />
              <Label className="cursor-pointer">{t('trail_page.reset_button')}</Label>
            </Button>
            <Button
              className="cursor-pointer hover:bg-gray-400 hover:text-white flex flex-col items-center justify-center bg-transparent text-gray-600 h-full w-[140px] rounded-none"
              onClick={() => {}}
            >
              <Cog />
              <Label className="cursor-pointer">{t('trail_page.settings_button')}</Label>
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
          <div className="h-full flex-1 flex justify-end">
            <div className="h-full flex items-center gap-4 px-6">
              <CircleUser className="min-h-[50px] min-w-[50px] " />
              <div className="flex flex-col gap-[1px]">
                <Label className="text-black text-[20px] leading-none">
                  {candidate.candidate_name}
                </Label>
                <Label className="text-gray-600 text-[12px]">{candidate.serial_number}</Label>
              </div>
            </div>
          </div>
        </div>
        <div className="relative flex-1 flex flex-col items-center justify-evenly">
          <div className="relative flex flex-col h-max w-max gap-[60px] items-center">
            <div className="flex w-max h-max items-end">
              {settings.language === Languages.ar ? (
                <>
                  <label className="text-[40px] font-black">{t('trail_page.second')}</label>
                  <label className="text-[50px] font-black">{seconds + ' :'}</label>
                </>
              ) : (
                ''
              )}
              <label className=" text-[50px] font-black">{t('trail_page.time')}</label>
              {settings.language === Languages.ar ? (
                ''
              ) : (
                <>
                  <label className="text-[50px] font-black">{': ' + seconds}</label>
                  <label className="text-[40px] font-black">{t('trail_page.second')}</label>
                </>
              )}
            </div>
            <div className="relative h-max w-full">
              <div className="z-[100] absolute h-full w-full m-auto flex items-center justify-center">
                <svg
                  style={{ height: `${itemWidth * 3}px`, width: `${itemWidth * 3}px` }}
                  className="transform -rotate-90"
                >
                  {/* Gray Background Circle */}
                  <circle
                    cx={svgCentre}
                    cy={svgCentre}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-gray-200"
                  />
                  {/* Animated Progress Circle */}
                  <circle
                    cx={svgCentre}
                    cy={svgCentre}
                    r={radius}
                    stroke={getStrokeColor()}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    style={{
                      strokeDashoffset: dashOffset,
                      transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease'
                    }}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div
                className="relative box-content overflow-hidden flex items-center justify-center "
                style={{ height: `${itemWidth * 3}px`, width: `${itemWidth * 3}px` }}
              >
                <div className="relative h-[250px] flex" style={{ width: `${itemWidth * 3}px` }}>
                  <div
                    className={`absolute z-[-1] w-full h-full flex items-center overflow-hidden  `}
                  >
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${currentIndex * itemWidth}px)` }}
                    >
                      <label
                        key={0}
                        className={`font-black text-center transition-all duration-500 ease-in-out`}
                        style={{
                          fontSize: `${font_size}px`,
                          transform: currentIndex === -1 ? `scale(${scale})` : 'scale(1)',
                          width: `${itemWidth}px`
                        }}
                      ></label>
                      {numbers.map((num, index) => {
                        let isActive = index === currentIndex

                        return (
                          <label
                            key={num}
                            className="font-black text-center transition-all duration-500 ease-in-out"
                            style={{
                              fontSize: `${font_size}px`,
                              width: `${itemWidth}px`,
                              transform: isActive ? `scale(${scale})` : 'scale(1)',
                              opacity: isActive ? 1 : 0.3, // Optional: dims the side numbers for focus
                              display: 'inline-block'
                            }}
                          >
                            {num}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex-1 gradiant_left"></div>
                  <div className="flex-1"></div>
                  <div className="flex-1 gradiant_right"></div>
                </div>
              </div>
            </div>
            <Button
              className="cursor-pointer h-[90px] w-[300px] px-6 py-4 text-4xl font-bold flex items-center justify-center leading-none"
              onClick={() => {
                if (isCountdownActive) {
                  handelReset()
                } else {
                  setCurrentIndex(0)
                  setisCountdownActive(true)
                }
              }}
            >
              {isActive ? t('trail_page.pause_button') : t('trail_page.start_button')}
              {isActive ? (
                <Pause className="min-h-[30px] min-w-[30px]" />
              ) : (
                <Play className="min-h-[30px] min-w-[30px]" />
              )}
            </Button>
            {/* <label className="text-2xl font-bold">{arduinoData}</label> */}
          </div>
          <div className="relative bg-gray-400 w-[70%] h-[8px] flex justify-between items-center ">
            <div className="absolute h-full bg-transparent w-full flex">
              <div className="flex-1 h-full bg-transparent">
                <div
                  className="h-full bg-black transition-all duration-500 ease-in rounded-r-md"
                  style={{
                    width: `${settings.level_1 ? (currentIndex < settings.level_1 ? (currentIndex / settings.level_1) * 100 : 100) : 0}%`
                  }}
                ></div>
              </div>

              <div className="flex-1 h-full bg-transparent">
                <div
                  className="h-full bg-black transition-all duration-500 ease-in rounded-r-md"
                  style={{
                    width: `${
                      settings.level_1 && settings.level_2
                        ? currentIndex < settings.level_1
                          ? 0
                          : currentIndex >= settings.level_1 && currentIndex < settings.level_2
                            ? ((currentIndex - settings.level_1) /
                                (settings.level_2 - settings.level_1)) *
                              100
                            : 100
                        : 0
                    }%`
                  }}
                ></div>
              </div>
              <div className="flex-1 h-full bg-transparent">
                <div
                  className="h-full bg-black transition-all duration-500 ease-in rounded-r-md"
                  style={{
                    width: `${
                      settings.level_2 && settings.level_3
                        ? currentIndex < settings.level_2
                          ? 0
                          : currentIndex >= settings.level_2 && currentIndex < settings.level_3
                            ? ((currentIndex - settings.level_2) /
                                (settings.level_3 - settings.level_2)) *
                              100
                            : 100
                        : 0
                    }%`
                  }}
                ></div>
              </div>
            </div>
            <div className="relative w-[20px] h-[20px] box-content border-6 border-white bg-black rounded-full">
              <label className="absolute left-1/2 -translate-x-1/2 top-[-30px] text-[16px] font-bold whitespace-nowrap">
                {t('trail_page.start_point')}
              </label>
            </div>
            <div
              className={`relative w-[20px] h-[20px] box-content border-6 border-white ${level_1 ? 'bg-green-600 animate-bounce' : 'bg-green-200'}  rounded-full`}
            >
              <label className="absolute left-1/2 -translate-x-1/2 top-[-30px] text-[16px] font-bold whitespace-nowrap">
                {t('trail_page.level_1')}
              </label>
              <label className="absolute left-1/2 -translate-x-1/2 bottom-[-30px] text-[16px] font-bold whitespace-nowrap">
                {settings.level_1}
              </label>
            </div>
            <div
              className={`relative w-[20px] h-[20px] box-content border-6 border-white ${level_2 ? 'bg-green-600 animate-bounce' : 'bg-green-200'} rounded-full`}
            >
              <label className="absolute left-1/2 -translate-x-1/2 top-[-30px] text-[16px] font-bold whitespace-nowrap">
                {t('trail_page.level_2')}
              </label>
              <label className="absolute left-1/2 -translate-x-1/2 bottom-[-30px] text-[16px] font-bold whitespace-nowrap">
                {settings.level_2}
              </label>
            </div>
            <div
              className={`relative w-[20px] h-[20px] box-content border-6 border-white ${level_3 ? 'bg-green-600 animate-bounce' : 'bg-green-200'} rounded-full`}
            >
              <label className="absolute left-1/2 -translate-x-1/2 top-[-30px] text-[16px] font-bold whitespace-nowrap">
                {t('trail_page.level_3')}
              </label>
              <label className="absolute left-1/2 -translate-x-1/2 bottom-[-30px] text-[16px] font-bold whitespace-nowrap">
                {settings.level_3}
              </label>
            </div>
          </div>
          <Button className="absolute top-[30px] left-[30px]" onClick={handleScroll}>
            Scroll Next
          </Button>
          <Button className="absolute top-[70px] left-[30px]" onClick={handleOpenDialog}>
            Scroll Next
          </Button>
        </div>
        {isCountdownActive && countdown != 0 ? (
          <div className="z-[200] absolute h-full w-full bg-[#ffffffb8] flex flex-col items-center justify-center">
            <label className="text-black font-black text-[50px]">{t('trail_page.countdown')}</label>
            <label className="text-green-600 font-black text-[100px]">{countdown}</label>
          </div>
        ) : (
          ''
        )}
      </section>
    </>
  )
}
