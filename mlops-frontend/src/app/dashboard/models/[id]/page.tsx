import ModelDetailClient from './ModelDetailClient'

export default function ModelDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ModelDetailClient modelId={params.id} />
    </div>
  )
}

