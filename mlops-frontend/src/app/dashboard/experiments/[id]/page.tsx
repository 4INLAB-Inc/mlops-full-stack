'use client'

import { Box } from '@chakra-ui/react'
import { ExperimentDetails } from '@/components/experiments/ExperimentDetails'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'  // Import useParams from next/navigation

interface ExperimentPageProps {
  params: {
    id: string
  }
}

export default function ExperimentPage() {
  const { id } = useParams(); 
  const [experiment, setExperiment] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return; // Prevent running fetch if `id` is undefined

    const fetchExperimentData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_MLOPS_BACKEND_API_URL}/api/experiments/${id}`); // Fetch experiment data using id from URL
        if (!response.ok) {
          throw new Error('데이터를 가져오는 데 실패했습니다'); // Error if response is not OK
        }
        const data = await response.json();
        setExperiment(data); // Set experiment data
      } catch (error: any) {
        setError(error.message); // Set error message
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchExperimentData();

    // const interval = setInterval(fetchExperimentData, 10000);

    // return () => clearInterval(interval); 
  }, [id]); // Re-run when `id` changes

  if (loading) {
    return <Box py={8}>로딩 중...</Box>; // Show loading message
  }

  if (error) {
    return <Box py={8}>오류: {error}</Box>; // Show error message
  }

  if (!experiment) {
    return <Box py={8}>실험 데이터를 찾을 수 없습니다</Box>; // If no experiment data is found
  }

  return (
    <Box py={8}>
      <ExperimentDetails experiment={experiment} /> {/* Display experiment details */}
    </Box>
  );
}
