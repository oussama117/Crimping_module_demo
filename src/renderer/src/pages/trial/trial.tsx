import { Button } from '@renderer/components/ui/button'
import { Label } from '@renderer/components/ui/label'
import {
  ArrowBigLeft,
  Check,
  CircleUser,
  ClockCheck,
  Cog,
  Info,
  Pause,
  Play,
  RotateCcw,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import yazakiLogo from '../../assets/logo.png'
import { useEffect, useState } from 'react'
import { useCandidateStore } from '@renderer/store/useCandidateStore'
import { Classifications, Languages, Levels, Results, TrialRow } from '@/types'
import { useTrialStore } from '@/renderer/src/store/useTrialStore'
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
import resetButton from '../../assets/ResetButton.png'
import { Card } from '@renderer/components/ui/card'
import terminal1 from '../../assets/terminal1.png'
import terminal2 from '../../assets/terminal2.png'
import terminal3 from '../../assets/terminal3.png'
import wire from '../../assets/wire.png'
import { useLevelStore } from '@renderer/store/setLeveStore'
import trialBg from '../../assets/Crimping_machine.png'

export default function Trial(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const { candidate, setCandidate } = useCandidateStore()
  const { trial, setTrial, resetTrial } = useTrialStore()
  const { settings } = useAppSettingsStore()
  const { level } = useLevelStore()
  const time =
    level === Levels.level_1
      ? settings.level_1
      : level === Levels.level_2
        ? settings.level_2
        : level === Levels.level_3
          ? settings.level_3
          : 35
  const [countdown, setCountdown] = useState(5)
  const [seconds, setSeconds] = useState(time ? time : 35)
  const [crimpedTerminals, setCrimpedTerminals] = useState(0)
  const [failedTerminals, setFailedTerminals] = useState(0)
  const [isCountdownActive, setisCountdownActive] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [trialResults, setTrialResults] = useState<Partial<TrialRow>>()
  // const [arduinoData, setArduinoData] = useState<any>()
  const [continuity, setContinuity] = useState(false)
  const [pedal, setPedal] = useState(false)
  const [reset, setReset] = useState(false)
  const [closeResetDialog, setCloseResetDialog] = useState(false)
  const [terminalTable, setTerminalTable] = useState(
    Array.from({ length: 10 }, (_, i) => ({ id: i, state: 'init' }))
  )

  type TrialPhase = 'idle' | 'countdown' | 'running' | 'finished'

  const [phase, setPhase] = useState<TrialPhase>('idle')

  // const handleSend = async (status: string) => {
  //   const success = await window.hardware.sendCommand(status)
  //   if (!success) {
  //     alert('Failed to send: Arduino might be disconnected!')
  //   }
  // }

  //  // HANDLERS =========================================

  const getStrokeColor = () => {
    if (seconds <= 5) return '#ef4444' // red-500
    if (seconds <= 10) return '#f97316' // orange-500
    return '#22c55e' // green-500
  }

  const handleCrimping = (data: string) => {
    setContinuity(data[2] === '1')
    setPedal(data[3] === '1')
    setReset(data[4] === '1')
  }

  const handelReset = () => {
    // handleSend('0000')
    setPhase('idle')
    setCrimpedTerminals(0)
    setFailedTerminals(0)
    setCurrentIndex(0)
    setCountdown(5)
    setIsActive(false)
    setisCountdownActive(false)
    if (time) {
      setSeconds(time)
    }
    setTerminalTable((prev) => prev.map((item) => ({ ...item, state: 'init' })))
  }

  // USEEFFECTS ==================================================

  useEffect(() => {
    if (closeResetDialog) return
    if (phase === 'countdown') return
    if (isCountdownActive) return

    if (pedal) {
      const tableLength = terminalTable.length + 1
      // Only trigger logic when pedal is pressed (DOWN)
      const newState = continuity ? 'succ' : 'fail'
      if (settings.terminals) {
        if (currentIndex < settings.terminals) {
          continuity
            ? setCrimpedTerminals((prev) => prev + 1)
            : setFailedTerminals((prev) => prev + 1)
        }
      }
      setTerminalTable((prevTable) =>
        prevTable.map((item, index) =>
          index === currentIndex ? { ...item, state: newState } : item
        )
      )
      setCurrentIndex((prev) => (prev + 1) % tableLength)
      setCloseResetDialog(continuity === false ? true : false)
    }
  }, [pedal])

  useEffect(() => {
    if (reset) setCloseResetDialog(false)
  }, [reset])

  useEffect(() => {
    if (currentIndex === 0) {
      setTerminalTable((prev) => prev.map((item) => ({ ...item, state: 'init' })))
      setCrimpedTerminals(0)
      setFailedTerminals(0)
      // console.log('Cycle restarted')
    }
  }, [currentIndex])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isCountdownActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setTerminalTable((prev) => prev.map((item) => ({ ...item, state: 'init' })))
            setCurrentIndex(0)
            setCrimpedTerminals(0)
            setFailedTerminals(0)
            setPhase('running')
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
  }, [isCountdownActive, time])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            setPhase('finished')
            return 0
          }
          setisCountdownActive(false)
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, time, seconds])

  useEffect(() => {
    if (isCountdownActive) setPhase('countdown')
    if (currentIndex === terminalTable.length && currentIndex > 0) setPhase('finished')

    if (seconds === 0) setPhase('finished')
    if (seconds === time) setPhase('idle')
  }, [pedal, currentIndex, isActive])

  useEffect(() => {
    if (phase !== 'finished') return
    if (currentIndex === terminalTable.length && seconds > 0) setIsActive(false)
    if (openDialog === true) return

    let failed_t = 0

    if (seconds === 0) {
      terminalTable.map((ter) => {
        failed_t = ter.state === 'fail' || ter.state === 'init' ? failed_t + 1 : failed_t
      })
      console.log('if failed_t: ', failed_t)
    } else {
      failed_t = failedTerminals
      console.log('else failed_t: ', failed_t)
    }

    setTerminalTable((prev) =>
      prev.map((item) => ({ ...item, state: item.state === 'succ' ? 'succ' : 'fail' }))
    )

    const classMap = {
      [Levels.level_1]: Classifications.beginner,
      [Levels.level_2]: Classifications.intermediate,
      [Levels.level_3]: Classifications.advanced,
      [Levels.level_init]: Classifications.class_init
    }

    const trialClass = classMap[level as keyof typeof classMap]

    const trialResult = crimpedTerminals >= 5 ? Results.success : Results.failure

    const trialRemainingTime =
      currentIndex === terminalTable.length && seconds > 0 && time ? time - (time - seconds) : 0

    const trialInstance: Partial<TrialRow> = {
      id: trial.id,
      candidate_id: trial.candidate_id,
      crimped_t: crimpedTerminals,
      failed_t: failed_t,
      remaining_time: trialRemainingTime,
      level: level,
      result: trialResult,
      class: trialClass
    }

    setTrialResults(trialInstance)
    setTrial({ ...trialInstance } as TrialRow)

    apis.updateTrial({ ...trialInstance } as TrialRow).then((data) => {
      console.log('trial save: ', data)
      if (!data.success) {
        console.error('error updating ', data.error)
        alert(`error updating err: ${data.error}`)
      }
    })
    setCloseResetDialog(false)
    setOpenDialog(true)

    console.log('Trail complete:', trialInstance)
  }, [phase, seconds, currentIndex, openDialog, time, terminalTable.length])

  useEffect(() => {
    const cleanup = window.hardware.onData((data) => {
      // console.log('Arduino message in UI:', data)
      handleCrimping(data)
    })
    return () => cleanup()
  }, [])

  return (
    <>
      <section className="w-full h-screen flex flex-col">
        <Dialog open={closeResetDialog} onOpenChange={setCloseResetDialog}>
          <DialogContent
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            className="p-0 z-[50] h-[500px] w-[700px] max-w-none overflow-hidden [&>button]:hidden"
          >
            <DialogHeader className="hidden">
              <DialogTitle>Progress</DialogTitle>
              <DialogDescription>This is a dialog for saving and resetting.</DialogDescription>
            </DialogHeader>
            <div className="w-full h-full flex">
              <div className="relative w-[300px] bg-gray-600 flex flex-col gap-4 items-center p-4 overflow-hidden text-white">
                <label className="mt-[20px] text-[30px] font-bold z-[10]">
                  {t('trial_page.reset')}
                </label>
                <img
                  src={resetButton}
                  alt="taping module"
                  className="absolute w-[200px] min-w-[100px] top-[-30px] opacity-[50%] "
                />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className=" flex flex-col gap-4 items-center px-4">
                  <Info className="stroke-3 min-w-[50px] min-h-[50px]" />
                  <label className=" text-xl font-bold">{t('trial_page.reset_instruction')}</label>
                  <p className="text-md text-gray-600 text-center">
                    {t('trial_page.reset_long_desc')}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            className="p-0 h-[60%] w-[900px] min-w-[900px] overflow-hidden [&>button]:hidden"
          >
            <DialogHeader className="hidden">
              <DialogTitle>Progress</DialogTitle>
              <DialogDescription>This is a dialog for saving and resetting.</DialogDescription>
            </DialogHeader>
            <div className="w-full h-full flex">
              <div className="relative w-[300px] bg-gray-600 flex flex-col gap-4 items-center justify-center p-4 overflow-hidden text-white">
                <ClockCheck className="z-[8] min-w-[80px] min-h-[80px]" />
                <label className="z-[8] text-4xl font-black text-center">
                  {t('trial_page.end_time')}
                </label>
                <label className={`text-xl text-center z-[8] `}>
                  {t(`trial_page.result.${trialResults?.result}`)}
                </label>
                <img
                  src={trialBg}
                  alt="taping module"
                  className="absolute w-[400px] min-w-[400px] opacity-[35%]  left-[-50%]"
                />
              </div>
              <div className="flex-1 flex flex-col items-center justify-between">
                <label className="mt-[20px] text-xl font-bold">
                  {t('trial_page.dialog_title')}
                </label>
                <div className="flex flex-col gap-4 items-center justify-evenly">
                  <div className="flex items-center gap-2 justify-center">
                    <div
                      className={`h-[20px] w-[20px] rounded-full ${
                        trialResults?.level === Levels.level_1
                          ? 'bg-yellow-400'
                          : trialResults?.level === Levels.level_2
                            ? 'bg-orange-400'
                            : trialResults?.level === Levels.level_3
                              ? 'bg-green-400'
                              : 'bg-black'
                      }`}
                    ></div>
                    <label className="text-center text-[40px] font-black">
                      {t(`trial_page.course_class.${trialResults?.class}`)}
                    </label>
                  </div>
                  <div className="grid grid-cols-10 grid-rows-1 gap-4">
                    {terminalTable.map((terminal) => {
                      return (
                        <div
                          className={`h-[30px] w-[30px] rounded-full flex items-center justify-center ${terminal.state === 'succ' ? 'bg-green-600' : 'bg-red-600'}`}
                        >
                          {terminal.state === 'succ' ? (
                            <Check className="stroke-white size-4 stroke-4" />
                          ) : (
                            <X className="stroke-white size-4 stroke-4" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex w-max leading-none">
                    <label className="text-center text-[120px] font-black">
                      {trialResults?.crimped_t}
                    </label>
                    <label className="text-center text-[120px] text-gray-600">/</label>
                    <label className="text-center text-[120px] font-black text-gray-600">
                      {settings.terminals}
                    </label>
                  </div>

                  <div className={`flex gap-4 items-center`}>
                    <div className="flex text-[25px] font-bold text-gray-600 gap-2">
                      <label className={`${settings.language === Languages.ar ? 'hidden' : ''}`}>
                        {t('trial_page.time')}:{' '}
                      </label>
                      <div className="flex text-black items-end">
                        <label className={` ${settings.language === Languages.ar ? '' : 'hidden'}`}>
                          {t('trial_page.second')}
                        </label>
                        <label>{time}</label>
                        <label className={` ${settings.language === Languages.ar ? 'hidden' : ''}`}>
                          {t('trial_page.second')}
                        </label>
                      </div>
                      <label className={`${settings.language === Languages.ar ? '' : 'hidden'}`}>
                        {' '}
                        :{t('trial_page.time')}
                      </label>
                    </div>
                    <label className="text-[25px] font-bold text-gray-600">/</label>
                    <div className="flex text-[25px] font-bold text-gray-600 gap-2">
                      <label className={`${settings.language === Languages.ar ? 'hidden' : ''}`}>
                        {t('score_board.table_header.remaining_time')}:
                      </label>
                      <div className="flex text-black">
                        <label className={settings.language === Languages.ar ? '' : 'hidden'}>
                          {t('trial_page.second')}
                        </label>
                        <label>{trialResults?.remaining_time}</label>
                        <label className={settings.language === Languages.ar ? 'hidden' : ''}>
                          {t('trial_page.second')}
                        </label>
                      </div>
                      <label className={`${settings.language === Languages.ar ? '' : 'hidden'}`}>
                        :{t('score_board.table_header.remaining_time')}
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    {trialResults?.result === Results.failure ? (
                      <label className="text-lg text-center">{t(`trial_page.line.failed`)}</label>
                    ) : (
                      <label className="text-lg text-center">
                        {t(`trial_page.line.${trialResults?.class}`)}
                      </label>
                    )}
                    {trialResults?.result === Results.failure ? (
                      <p className="text-center text-gray-600 px-8">{t('trial_page.failed_p')}</p>
                    ) : (
                      <p className="text-center text-gray-600 px-8">{t('trial_page.success_p')}</p>
                    )}
                  </div>
                </div>
                <div className="w-full flex justify-end">
                  <div className="h-[60px] w-full flex">
                    <Button
                      onClick={() => {
                        handelReset()
                        setOpenDialog(false)
                        setCloseResetDialog(false)
                      }}
                      className="min-h-full flex-1 rounded-none bg-gray-600 cursor-pointer hover:opacity-[70%]"
                    >
                      <RotateCcw className="min-w-[20px] min-h-[20px]" />
                      <label className="text-lg font-bold cursor-pointer text-white">
                        {t('trial_page.try_again_button')}
                      </label>
                    </Button>
                    <Button
                      onClick={() => {
                        handelReset()
                        resetTrial()
                        setCandidate({ id: null, serial_number: null, candidate_name: null })
                        setOpenDialog(false)
                        setCloseResetDialog(false)
                        navigate('/')
                      }}
                      className="min-h-full flex-1 bg-[#DA5949] hover:bg-[#D88D87] cursor-pointer rounded-none"
                    >
                      <ArrowBigLeft className="min-w-[20px] min-h-[20px]" />
                      <label className="text-lg font-bold cursor-pointer text-white">
                        {t('trial_page.exit_button')}
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
                resetTrial()
                setCandidate({ id: null, serial_number: null, candidate_name: null })
                setOpenDialog(false)
                setCloseResetDialog(false)
                navigate('/')
              }}
            >
              <ArrowBigLeft />
              <Label className="cursor-pointer">{t('trial_page.return_button')}</Label>
            </Button>
            <Button
              className="cursor-pointer hover:bg-gray-400 hover:text-white flex flex-col items-center justify-center bg-transparent text-gray-600 h-full w-[140px] rounded-none"
              onClick={() => {
                handelReset()
                setOpenDialog(false)
                setCloseResetDialog(false)
              }}
            >
              <RotateCcw />
              <Label className="cursor-pointer">{t('trial_page.reset_button')}</Label>
            </Button>
            <Button
              className="cursor-pointer hover:bg-gray-400 hover:text-white flex flex-col items-center justify-center bg-transparent text-gray-600 h-full w-[140px] rounded-none"
              onClick={() => {
                handelReset()
                resetTrial()
                setCandidate({ id: null, serial_number: null, candidate_name: null })
                setCloseResetDialog(false)
                setOpenDialog(false)
                navigate('/settings')
              }}
            >
              <Cog />
              <Label className="cursor-pointer">{t('trial_page.settings_button')}</Label>
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
                className={`bg-red-600 text-white font-bold px-[10px] py-[5px] ${settings.language === Languages.ar ? 'rounded-s-md' : 'rounded-e-md'} `}
              >
                {settings.module_number}
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
          <div className="relative flex flex-col h-max w-max gap-[30px] items-center">
            <Button
              className="cursor-pointer h-[90px] w-[300px] px-6 py-4 text-4xl font-bold flex items-center justify-center leading-none"
              onClick={() => {
                if (isActive) {
                  handelReset()
                } else {
                  setCurrentIndex(0)
                  setisCountdownActive(true)
                  setPhase('countdown')
                }
              }}
            >
              {isActive ? t('trial_page.reset_button') : t('trial_page.start_button')}
              {isActive ? (
                <Pause className="min-h-[30px] min-w-[30px]" />
              ) : (
                <Play className="min-h-[30px] min-w-[30px]" />
              )}
            </Button>
            <div className="relative h-max w-full">
              <div className="flex flex-col gap-4 ">
                <div className="grid grid-cols-5 grid-rows-2 gap-4">
                  {terminalTable.map((terminalInst) => {
                    return (
                      <div
                        key={terminalInst.id}
                        className={`h-[250px] w-[250px] flex flex-col items-center justify-between  ${currentIndex === terminalInst.id ? 'scale-[1.1]' : ''} transition-all duration-100 ease-in-out`}
                      >
                        <label className="font-bold text-2xl">
                          {terminalInst.state === 'succ'
                            ? t('score_board.results.success')
                            : terminalInst.state === 'fail'
                              ? t('score_board.results.failure')
                              : ''}
                        </label>
                        <Card
                          className={`relative w-[200px] h-[200px] bg-transparent border-none rounded-none p-0 shadow-none  ${pedal && currentIndex === terminalInst.id ? 'scale-[0.9]' : ''} transition-all duration-200 ease-in-out`}
                        >
                          <div
                            className={`relative h-full w-full overflow-hidden rounded-xl shadow-lg ${currentIndex === terminalInst.id ? 'border-4 border-gray-600' : ''} ${terminalInst.state === 'succ' ? 'bg-[#15ff004c]' : terminalInst.state === 'fail' ? 'bg-[#ff030333]' : 'bg-[#00000013]'}`}
                          >
                            <div className="h-[200px] absolute top-[20px] inset-0 mx-auto flex flex-col items-center">
                              <img
                                className="z-[2] absolute w-[38px] top-0"
                                src={terminal3}
                                alt="wire terminal"
                              />
                              <img
                                className="z-[4] absolute w-[24px] top-[50px]"
                                src={terminal1}
                                alt="wire terminal"
                              />
                              <img
                                className="z-[1] absolute w-[24px] top-[87px]"
                                src={terminal2}
                                alt="wire terminal"
                              />
                            </div>
                            <img
                              className={`z-[3] absolute inset-0 mx-auto w-[16px] ${terminalInst.state === 'succ' ? 'top-[65px]' : terminalInst.state === 'init' && currentIndex === terminalInst.id && continuity ? 'top-[65px]' : 'top-[135px]'} transition-all duration-100 ease-in-out`}
                              src={wire}
                              alt="wire"
                            />
                          </div>
                          <div
                            className={`absolute h-[50px] w-[50px] top-[-25px] right-[-25px] rounded-full flex items-center justify-center ${terminalInst.state === 'fail' ? 'bg-red-600' : terminalInst.state === 'succ' ? 'bg-green-600' : 'hidden'}`}
                          >
                            {terminalInst.state === 'fail' ? (
                              <X className="stroke-white stroke-4" />
                            ) : (
                              <Check className="stroke-white stroke-4" />
                            )}
                          </div>
                        </Card>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center w-[90%] gap-4">
            <div className="flex w-max h-max items-end">
              <div
                className={`pr-[15px] flex items-center gap-2 ${settings.language === Languages.ar ? 'hidden' : ''}`}
              >
                <div
                  className={`h-[25px] w-[25px] rounded-full ${
                    level === Levels.level_1
                      ? 'bg-yellow-400'
                      : level === Levels.level_2
                        ? 'bg-orange-400'
                        : level === Levels.level_3
                          ? 'bg-green-400'
                          : 'bg-black'
                  }`}
                ></div>
                <label className={`text-[40px] font-black `}>
                  {t(
                    `trial_page.course_class.${level === Levels.level_3 ? Classifications.advanced : level === Levels.level_2 ? Classifications.intermediate : Classifications.beginner}`
                  )}
                  ,
                </label>
              </div>
              {settings.language === Languages.ar ? (
                <>
                  <label className="text-[30px] font-black">{t('trial_page.second')}</label>
                  <label className="text-[40px] font-black">{seconds + ' :'}</label>
                </>
              ) : (
                ''
              )}
              <label className=" text-[40px] font-black">{t('trial_page.time')}</label>
              {settings.language === Languages.ar ? (
                ''
              ) : (
                <>
                  <label className="text-[40px] font-black">{': ' + seconds}</label>
                  <label className="text-[30px] font-black">{t('trial_page.second')}</label>
                </>
              )}
              <div
                className={`pl-[15px] flex items-center gap-2 ${settings.language === Languages.ar ? '' : 'hidden'}`}
              >
                <label className={` text-[40px] font-black `}>
                  ,
                  {t(
                    `trial_page.course_class.${level === Levels.level_3 ? Classifications.advanced : level === Levels.level_2 ? Classifications.intermediate : Classifications.beginner}`
                  )}
                </label>
                <div
                  className={`h-[25px] w-[25px] rounded-full ${
                    level === Levels.level_1
                      ? 'bg-yellow-400'
                      : level === Levels.level_2
                        ? 'bg-orange-400'
                        : level === Levels.level_3
                          ? 'bg-green-400'
                          : 'bg-black'
                  }`}
                ></div>
              </div>
            </div>
            <div className="w-[100%] h-[20px] bg-gray-400 rounded-full">
              <div
                className="h-full rounded-full transition-all duration-200 ease-in-out"
                style={{
                  width: `${(seconds / (time || 35)) * 100}%`,
                  backgroundColor: getStrokeColor()
                }}
              ></div>
            </div>
          </div>
        </div>
        {isCountdownActive && countdown != 0 ? (
          <div className="z-[50] absolute h-full w-full bg-[#ffffffb8] flex flex-col items-center justify-center">
            <label className="text-black font-black text-[50px]">{t('trial_page.countdown')}</label>
            <label className="text-green-600 font-black text-[100px]">{countdown}</label>
          </div>
        ) : (
          ''
        )}
        <img
          src={trialBg}
          alt="crimping module"
          className="absolute z-[-1] h-[80%] opacity-[20%] bottom-[30px] left-[-70px]"
        />
      </section>
    </>
  )
}
