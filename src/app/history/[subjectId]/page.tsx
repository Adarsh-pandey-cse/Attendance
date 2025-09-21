import { HistoryClientPage } from '@/components/history-client-page';

type HistoryPageProps = {
  params: {
    subjectId: string;
  };
};

export default function HistoryPage({ params }: HistoryPageProps) {
  return <HistoryClientPage subjectId={params.subjectId} />;
}
