import CrrPanel from '../components/CrrPanel'
import GbmForm from '../components/GbmForm'
import GbmPathsChart from '../components/GbmPathsChart'
import GbmStats from '../components/GbmStats'
import LogReturnHistogram from '../components/LogReturnHistogram'
import { useGbm } from '../hooks/useGbm'

export default function ContinuousPage() {
  const { form, setForm, result, error, submit } = useGbm()

  return (
    <>
      <GbmForm form={form} setForm={setForm} onSubmit={submit} />
      {error && <p role="alert" className="error">{error}</p>}
      {result && (
        <>
          <GbmStats params={result.params} res={result.res} />
          <GbmPathsChart params={result.params} res={result.res} />
          <LogReturnHistogram params={result.params} res={result.res} />
          <CrrPanel rows={result.crr} kind={result.kind} />
        </>
      )}
    </>
  )
}
