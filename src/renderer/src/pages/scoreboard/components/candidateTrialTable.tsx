import { TrialJoinCandidate } from '@/types'
import { Button } from '@renderer/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
import apis from '@renderer/pages/api/api'
import { Trash2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Props {
  trials: TrialJoinCandidate[]
  onDelete: (id: number) => void
}

export function CandidateTrialsTable({ onDelete, trials }: Props) {
  const { t } = useTranslation()

  const handleDelete = async (candidateId: number | null) => {
    if (candidateId === null) return

    // 1. Optimistic UI: Update the parent immediately
    // This makes the row disappear instantly
    onDelete(candidateId)

    try {
      // 2. Database Update
      const response = await apis.deleteCandidateAndTrial(candidateId)

      if (!response) {
        console.error('Delete failed in database')
      }
    } catch (error) {
      console.error('Failed to delete:', error)
      alert(`Failed to delete: error`)
    }
  }
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('score_board.table_header.candidate_name')}</TableHead>
            <TableHead>{t('score_board.table_header.serial_number')}</TableHead>
            <TableHead>{t('score_board.table_header.level')}</TableHead>
            <TableHead>{t('score_board.table_header.classification')}</TableHead>
            <TableHead>{t('score_board.table_header.crimped_t')}</TableHead>
            <TableHead>{t('score_board.table_header.failed_t')}</TableHead>
            <TableHead>{t('score_board.table_header.remaining_time')}</TableHead>
            <TableHead>{t('score_board.table_header.result')}</TableHead>
            <TableHead>{t('score_board.table_header.date')}</TableHead>
            <TableHead className="text-center">{t('score_board.table_header.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trials.length > 0 ? (
            trials.map((trial) => (
              <TableRow key={trial.id}>
                {/* Candidate Info */}
                <TableCell className="font-medium">
                  {trial.candidate?.candidate_name || 'N/A'}
                </TableCell>
                <TableCell>{trial.candidate?.serial_number || 'N/A'}</TableCell>

                {/* Trial Details - Using trial_page translation paths */}
                <TableCell>{trial.level ? t(`trial_page.${trial.level}`) : 'N/A'}</TableCell>
                <TableCell>{trial.class ? t(`trial_page.class.${trial.class}`) : 'N/A'}</TableCell>
                <TableCell>{trial.crimped_t === 0 ? 'N/A' : trial.crimped_t}</TableCell>
                <TableCell>{trial.failed_t === 0 ? 'N/A' : trial.failed_t}</TableCell>

                {/* Result as Plain Text - Using score_board path */}
                <TableCell>{trial.remaining_time ? trial.remaining_time : 'N/A'}</TableCell>
                <TableCell>
                  {trial.result ? t(`score_board.results.${trial.result}`) : 'N/A'}
                </TableCell>

                {/* Date */}
                <TableCell className="text-muted-foreground">
                  {trial.created_at ? new Date(trial.created_at).toLocaleDateString() : '-'}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-center">
                  <Button
                    className="cursor-pointer"
                    variant="destructive"
                    onClick={() => {
                      handleDelete(trial.candidateId)
                    }}
                  >
                    <Trash2Icon className="mr-2 h-4 w-4" />
                    <label className="cursor-pointer">{t('score_board.delete_button')}</label>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                {t('score_board.no_results', 'No results found.')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
