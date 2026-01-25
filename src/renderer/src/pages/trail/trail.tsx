import { Button } from '@renderer/components/ui/button'
import { Label } from '@renderer/components/ui/label'
import { ArrowBigLeft, CircleUser, ClockCheck, Cog, Pause, Play, RotateCcw } from 'lucide-react'
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
import trailBg from '../../assets/trail_bg.png'

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
  // const [arduinoData, setArduinoData] = useState<any>()

  const strokeWidth = 20 // Adjust thickness here
  const radius = 190 - strokeWidth
  const circumference = 2 * Math.PI * radius
  const progress = seconds / (settings.trail_time || 60)
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

  // USEEFFECTS ==================================================

  useEffect(() => {
    if (level_3) handleSend('1111')
    else if (level_2) handleSend('1110')
    else if (level_1) handleSend('1100')
    else handleSend('1000')
  }, [currentIndex, settings, level_1, level_2, level_3])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isCountdownActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCurrentIndex(0)
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
    const l1 = settings.level_1 != null && currentIndex >= settings.level_1
    const l2 = settings.level_2 != null && currentIndex >= settings.level_2
    const l3 = settings.level_3 != null && currentIndex >= settings.level_3
    // console.log('currentIndex: ', currentIndex)

    setLevel_1(l1)
    setLevel_2(l2)
    setLevel_3(l3)
    // Determine if the trial should finish
    const isTimeOut = seconds === 0
    const isWorkFinished = currentIndex === numbers.length - 1

    // If neither condition is met, do nothing and wait
    if (openDialog === true) return
    if (seconds === settings.trail_time) return
    if (!isTimeOut && !isWorkFinished) return
    // if (!isActive) return
    // console.log('numbers.length: ', numbers.length)

    let trailLevel = Levels.level_init
    if (l3) trailLevel = Levels.level_3
    else if (l2) trailLevel = Levels.level_2
    else if (l1) trailLevel = Levels.level_1

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
    console.log('trial: ', trailInstance)
    setTrail({ ...trailInstance } as TrailRow)
    apis.updateTrail({ ...trailInstance } as TrailRow).then((data) => {
      console.log('trail save: ', data)
      if (!data.success) {
        // console.error('error updating ')
        alert(`error updating err: ${data.error}`)
      }
    })

    setOpenDialog(true)
    // console.log('Trail complete:', trailInstance)
  }, [seconds, level_1, level_2, level_3, currentIndex])

  useEffect(() => {
    const cleanup = window.hardware.onData(() => {
      // console.log('Arduino message in UI:', data)
      if (seconds > 0) {
        handleScroll()
      }
      // setArduinoData(data)
    })

    return () => cleanup()
  }, [])

  return (
    <>
      <section className="w-full h-screen flex flex-col">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="p-0 z-[101] h-[60%] w-[900px] min-w-[900px] overflow-hidden [&>button]:hidden">
            <DialogHeader className="hidden">
              <DialogTitle>Progress</DialogTitle>
              <DialogDescription>This is a dialog for saving and resetting.</DialogDescription>
            </DialogHeader>
            <div className="w-full h-full flex">
              <div className="relative w-[300px] bg-gray-600 flex flex-col gap-4 items-center justify-center p-4 overflow-hidden text-white">
                <ClockCheck className="z-[1] min-w-[80px] min-h-[80px]" />
                <label className="z-[1] text-5xl font-black text-center">
                  {t('trail_page.end_time')}
                </label>
                <label className={`text-xl text-center z-[1] `}>
                  {t(`trail_page.result.${trailResults?.result}`)}
                </label>
                <img
                  src={trailBg}
                  alt="taping module"
                  className="absolute w-[500px] min-w-[500px] opacity-[20%]  left-[-70%]"
                />
              </div>
              <div className="flex-1 flex flex-col items-center justify-between">
                <label className="mt-[20px] text-xl font-bold">
                  {t('trail_page.dialog_title')}
                </label>
                <div className=" flex flex-col gap-2 items-center px-4">
                  <label className="text-center text-[40px] font-black">
                    {t(`trail_page.${trailResults?.level}`)}
                  </label>
                  <div className="flex w-max leading-none">
                    <label className="text-center text-[120px] font-black">
                      {trailResults?.turns_m}
                      <span className="text-[40px] font-bold">{t('trail_page.turn')}</span>
                    </label>
                    <label className="text-center text-[120px] text-gray-600">/</label>
                    <label className="text-center text-[120px] font-black text-gray-600">
                      {settings.trail_time}
                      <span className="text-[40px] font-bold text-gray-600">
                        {t('trail_page.second')}
                      </span>
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
                      {t(`trail_page.class.${trailResults?.class}`)}
                    </label>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    {trailResults?.result === Results.failure ? (
                      <label className="text-lg text-center">{t(`trail_page.line.failed`)}</label>
                    ) : (
                      <label className="text-lg text-center">
                        {t(`trail_page.line.${trailResults?.class}`)}
                      </label>
                    )}
                    {trailResults?.result === Results.failure ? (
                      <p className="text-center text-gray-600">{t('trail_page.failed_p')}</p>
                    ) : (
                      <p className="text-center text-gray-600">{t('trail_page.success_p')}</p>
                    )}
                  </div>
                </div>
                <div className="w-full flex justify-end">
                  <div className="h-[60px] w-full flex">
                    <Button
                      onClick={() => {
                        handelReset()
                        setOpenDialog(false)
                      }}
                      className="min-h-full flex-1 rounded-none bg-gray-600 cursor-pointer hover:opacity-[70%]"
                    >
                      <RotateCcw className="min-w-[20px] min-h-[20px]" />
                      <label className="text-lg font-bold cursor-pointer text-white">
                        {t('trail_page.try_again_button')}
                      </label>
                    </Button>
                    <Button
                      onClick={() => {
                        handelReset()
                        setOpenDialog(false)
                        navigate('/')
                      }}
                      className="min-h-full flex-1 bg-[#DA5949] hover:bg-[#D88D87] cursor-pointer rounded-none"
                    >
                      <ArrowBigLeft className="min-w-[20px] min-h-[20px]" />
                      <label className="text-lg font-bold cursor-pointer text-white">
                        {t('trail_page.exit_button')}
                      </label>
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
              onClick={() => {
                navigate('/settings')
              }}
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
          {/* <Button className="absolute top-[30px] left-[30px]" onClick={handleScroll}>
            Scroll Next
          </Button>
          <Button className="absolute top-[70px] left-[30px]" onClick={handleOpenDialog}>
            Scroll Next
          </Button> */}
        </div>
        {isCountdownActive && countdown != 0 ? (
          <div className="z-[200] absolute h-full w-full bg-[#ffffffb8] flex flex-col items-center justify-center">
            <label className="text-black font-black text-[50px]">{t('trail_page.countdown')}</label>
            <label className="text-green-600 font-black text-[100px]">{countdown}</label>
          </div>
        ) : (
          ''
        )}
        <img
          src={trailBg}
          alt="taping module"
          className="absolute z-[-1] h-[55%] opacity-[20%] right-[-80px]"
        />
        {/* <img
          src={trailBg}
          alt="taping module"
          className="absolute z-[-1] h-[55%] opacity-[20%] bottom-[0%] left-[-200px]"
        /> */}
      </section>
    </>
  )
}
