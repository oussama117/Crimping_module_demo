import { useEffect, useState } from 'react'
import { TrailJoinCandidate } from '@/types'

export default function ScoreBoard(): React.JSX.Element {
  const [scoreBoard, setScoreBoard] = useState<TrailJoinCandidate[]>()
  useEffect(() => {
    ;(window as any).api.getTrailJoinCandidate().then((data: any) => {
      console.log(data)
      setScoreBoard(data)
    })
  }, [])

  return (
    <>
      {(scoreBoard || []).map((item: TrailJoinCandidate, index) => (
        <div
          key={item.id || index}
          className="flex flex-row items-center justify-between border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors"
        >
          {/* Left Side: Candidate Info */}
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-gray-800">
              {item.candidate?.candidate_name || 'Unknown Candidate'}
            </span>
            <span className="text-sm text-gray-500 font-mono">
              SN: {item.candidate?.serial_number || 'N/A'}
            </span>
            <span className="text-xs text-gray-400">
              {item.created_at ? new Date(item.created_at).toLocaleString() : 'No Date'}
            </span>
          </div>

          {/* Middle Side: Test Performance */}
          <div className="flex flex-row gap-8 items-center text-center">
            <div className="flex flex-col">
              <span className="text-xs uppercase text-gray-400 font-semibold">Turns</span>
              <span className="font-medium">{item.turns_m ?? 0}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase text-gray-400 font-semibold">Time</span>
              <span className="font-medium">{item.time_elapsed ?? 0}s</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase text-gray-400 font-semibold">Level</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded capitalize">
                {item.level?.replace('_', ' ') || 'N/A'}
              </span>
            </div>
          </div>

          {/* Right Side: Result Status */}
          <div className="flex items-center">
            <div
              className={`px-4 py-1 rounded-full text-sm font-bold uppercase shadow-sm ${
                item.result === 'success'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}
            >
              {item.result || 'In Progress'}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
