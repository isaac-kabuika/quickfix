import { NextApiRequest, NextApiResponse } from 'next'
import { analyzeBug } from '../../services/bugAnalysisService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { projectId, bugReportId } = req.body
      const { bugLocations, suggestedFix } = await analyzeBug(projectId, bugReportId)
      res.status(200).json({ bugLocations, suggestedFix })
    } catch (error) {
      res.status(500).json({ error: 'Error analyzing bug' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}