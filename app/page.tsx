'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
}

interface DataPoint {
  score: string;
  frequency: number;
}

const StatisticalVisualizer: React.FC = () => {
  const [input, setInput] = useState<string>('The class average is 77.31% with a standard deviation of 15.17%. Scores ranged from 24% to 100%.');
  const [sampleSize, setSampleSize] = useState<string>('200');
  const [data, setData] = useState<DataPoint[] | null>(null);
  const [error, setError] = useState<string>('');

  const parseStats = (text: string): Stats => {
    try {
      const meanMatch = text.match(/average is (\d+\.?\d*)%/);
      const stdDevMatch = text.match(/deviation of (\d+\.?\d*)%/);
      const rangeMatch = text.match(/from (\d+)% to (\d+)%/);

      if (!meanMatch?.[1] || !stdDevMatch?.[1] || !rangeMatch?.[1] || !rangeMatch?.[2]) {
        throw new Error('Could not parse all required statistics from the text. Please check the format.');
      }

      return {
        mean: parseFloat(meanMatch[1]),
        stdDev: parseFloat(stdDevMatch[1]),
        min: parseFloat(rangeMatch[1]),
        max: parseFloat(rangeMatch[2])
      };
    } catch (e) {
      throw new Error(`Error parsing statistics: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  const generateNormalDistribution = (stats: Stats): DataPoint[] => {
    const { mean, stdDev, min, max } = stats;
    const points = 50;
    const data: DataPoint[] = [];
    const sampleSizeNum = parseInt(sampleSize);

    if (isNaN(sampleSizeNum) || sampleSizeNum <= 0) {
      throw new Error('Invalid sample size');
    }

    for (let i = 0; i < points; i++) {
      const x = min + (i * (max - min) / (points - 1));
      const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * 
                Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
      data.push({
        score: x.toFixed(1),
        frequency: Math.round(y * sampleSizeNum * 100) / 100
      });
    }

    return data;
  };

  const handleVisualize = (): void => {
    try {
      setError('');
      const stats = parseStats(input);
      const visualData = generateNormalDistribution(stats);
      setData(visualData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
      setData(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInput(e.target.value);
  };

  const handleSampleSizeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSampleSize(e.target.value);
  };

  return (
    <div className="w-full max-w-4xl p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Statistical Text Visualizer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <textarea
              className="w-full min-h-[100px] p-2 border rounded-md"
              value={input}
              onChange={handleInputChange}
              placeholder="Enter statistical text..."
            />
            <div className="flex space-x-4 items-center">
              <Input
                type="number"
                value={sampleSize}
                onChange={handleSampleSizeChange}
                placeholder="Sample size"
                className="w-32"
                min="1"
              />
              <Button onClick={handleVisualize}>Visualize</Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {data && data.length > 0 && (
            <div className="w-full h-96 mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <XAxis
                    dataKey="score"
                    label={{ value: 'Score (%)', position: 'bottom', offset: -5 }}
                  />
                  <YAxis
                    label={{
                      value: 'Frequency',
                      angle: -90,
                      position: 'insideLeft',
                      offset: -5
                    }}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="frequency"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticalVisualizer;