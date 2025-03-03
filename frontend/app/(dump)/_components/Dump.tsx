'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, RefreshCcw, Lock, Calendar, Clock } from 'lucide-react'
// import ResultsViewer from './resultviewer'

const versionOptions = [
    "normal_Rel_v391_20240620",
    "Legacy_Rel_v391_20240620_eng",
    "PRO_Rel_v100_20240329",
    "PRO_Rel_v100_20240329_eng",
    "PRO_Rel_v1.0.15_kor",
    "PRO_Rel_v1.0.16_kor_x64",
    "Rek_v390_ing",
    "Rel_v390_SRM",
    "Rel_v390_R190522_Touch",
    "Rel_v390_R190522_ENG_UA",
    "Rel_v390_R190522_ENG",
    "Rel_v390_R190522",
    "Rel_v390_R180604_ENG",
    "Rel_v390_R180518",
    "Rel_v390_R170405_For_Nanji",
    "Rel_v304_R160624_긴급패치",
    "Rel_v304_R160224",
    "Rel_v303_R150415",
    "Rel_v30_r140514",
    "Rel_v214_R160706_Touch",
    "Rel_v214_R160125",
    "Rel_v214_R131112",
    "Rel_v214_R130630",
    "Rel_v214_CimonDbm_pdb",
    "Rel_v214_R아름테크놀러지",
    "OEM"
]

const ALLOWED_FILE_TYPES = ['.dmp', '.txt']

const Dump = () => {
    const [selectedVersion, setSelectedVersion] = useState(versionOptions[0])
    const [fileName, setFileName] = useState('No file selected')
    const [result, setResult] = useState('Analysis results will appear here')
    const [guidance, setGuidance] = useState('Processing...')
    const [isLoading, setIsLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [fileError, setFileError] = useState('')
    const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'success' | 'error'>('idle')

    const isValidFileType = (file: File) => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase()
        return ALLOWED_FILE_TYPES.includes(extension)
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        setFileError('')
        setAnalysisStatus('idle')

        if (selectedFile) {
            if (isValidFileType(selectedFile)) {
                setFile(selectedFile)
                setFileName(selectedFile.name)
            } else {
                setFile(null)
                setFileName('No file selected')
                setFileError(`Invalid file type. Please select ${ALLOWED_FILE_TYPES.join(' or ')} files.`)
            }
        }
    }

    const handleBoxClick = () => {
        if (!isLoading) {
            document.getElementById('dump_file')?.click()
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        if (!isLoading) {
            setIsDragging(true)
        }
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        if (!isLoading) {
            setIsDragging(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (isLoading) {
            return // 분석 중에는 파일 드롭 무시
        }

        setIsDragging(false)
        setFileError('')
        setAnalysisStatus('idle')

        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) {
            if (isValidFileType(droppedFile)) {
                setFile(droppedFile)
                setFileName(droppedFile.name)
            } else {
                setFile(null)
                setFileName('No file selected')
                setFileError(`Invalid file type. Please select ${ALLOWED_FILE_TYPES.join(' or ')} files.`)
            }
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!file) {
            alert('Please select a file.')
            return
        }

        setIsLoading(true)
        setGuidance('Uploading file...')
        setResult('Preparing analysis...')
        setAnalysisStatus('idle')

        const formData = new FormData()
        formData.append('dump_file', file)

        try {
            const uploadResponse = await fetch('http://172.35.13.62:4000/dump/upload', {
                method: 'POST',
                body: formData
            })

            if (uploadResponse.ok) {
                const uploadData = await uploadResponse.json()
                const filename = uploadData.filename

                setGuidance('Processing file contents...')
                setResult('Analyzing...')

                const response = await fetch('http://172.35.13.62:4000/dump/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        filename,
                        version: selectedVersion
                    })
                })

                if (response.ok) {
                    const data = await response.json()
                    setResult(data.log || 'No log data available')
                    setGuidance('Analysis complete.')
                    setAnalysisStatus('success')
                } else {
                    const error = await response.json()
                    setResult(`Error: ${error.error}`)
                    setGuidance('Analysis failed.')
                    setAnalysisStatus('error')
                }
            } else {
                const error = await uploadResponse.json()
                setResult(`Upload error: ${error.error}`)
                setGuidance('Upload failed.')
                setAnalysisStatus('error')
            }
        } catch (err) {
            setResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
            setGuidance('An unexpected error occurred.')
            setAnalysisStatus('error')
        } finally {
            setIsLoading(false)
        }
    }

    const StatusIcon = () => {
        switch (analysisStatus) {
            case 'success':
                return <CheckCircle className="w-6 h-6 text-green-500" />
            case 'error':
                return <AlertCircle className="w-6 h-6 text-red-500" />
            default:
                return null
        }
    }

    return (
        <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 p-8 min-h-screen xl:min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col xl:flex-row gap-8 max-w-[1600px] mx-auto">
                <div className="w-full xl:w-[600px] flex-shrink-0">
                    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                                <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">
                                    Dump File Analysis
                                </h2>
                            </div>

                            <select
                                value={selectedVersion}
                                onChange={(e) => setSelectedVersion(e.target.value)}
                                disabled={isLoading}
                                className="w-full mb-6 p-3 border-2 border-zinc-200 dark:border-zinc-700 
                                       rounded-lg text-zinc-700 dark:text-white bg-white dark:bg-zinc-800 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       transition-all duration-200
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {versionOptions.map(version => (
                                    <option key={version} value={version}>{version}</option>
                                ))}
                            </select>

                            <div
                                onClick={handleBoxClick}
                                className={`
                                    relative overflow-hidden
                                    bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed 
                                    ${isDragging ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/50' :
                                        fileError ? 'border-red-400' :
                                            isLoading ? 'border-zinc-300 dark:border-zinc-700 opacity-50' :
                                                'border-zinc-300 dark:border-zinc-700'}
                                    rounded-xl p-8 min-h-[300px] mb-6
                                    transition-all duration-200
                                    ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50'}
                                    active:bg-blue-100 dark:active:bg-blue-900/70
                                    group
                                `}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {isLoading && (
                                    <div className="absolute inset-0 bg-zinc-100/80 dark:bg-zinc-900/80 
                                                backdrop-blur-[2px] flex items-center justify-center z-10">
                                        <div className="flex flex-col items-center gap-3 text-zinc-500 dark:text-zinc-400">
                                            <Lock className="w-8 h-8" />
                                            <p className="text-sm font-medium">File upload disabled during analysis</p>
                                        </div>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    id="dump_file"
                                    onChange={handleFileChange}
                                    accept={ALLOWED_FILE_TYPES.join(',')}
                                    className="hidden"
                                    disabled={isLoading}
                                    onClick={e => e.stopPropagation()}
                                />

                                <div className="flex flex-col items-center justify-center text-center h-full gap-4">
                                    <Upload className={`w-12 h-12 text-blue-500 
                                                    ${!isLoading && 'group-hover:scale-110'} 
                                                    transition-transform
                                                    ${isLoading && 'opacity-50'}`}
                                    />

                                    <div>
                                        <p className={`text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2
                                                    ${isLoading && 'opacity-50'}`}>
                                            Drag your file here or click to upload
                                        </p>
                                        <p className={`text-sm text-zinc-500 dark:text-zinc-400
                                                    ${isLoading && 'opacity-50'}`}>
                                            Allowed file types: {ALLOWED_FILE_TYPES.join(', ')}
                                        </p>
                                    </div>

                                    {fileError && (
                                        <div className="mt-2 text-red-500 text-sm font-medium flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            {fileError}
                                        </div>
                                    )}

                                    {fileName !== 'No file selected' && !fileError && (
                                        <div className="mt-2 text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            {fileName}
                                        </div>
                                    )}

                                    {guidance && !fileError && (
                                        <div className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm font-medium flex items-center gap-2">
                                            {isLoading ? (
                                                <RefreshCcw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <StatusIcon />
                                            )}
                                            {guidance}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !file || !!fileError}
                                className="w-full py-4 px-6 bg-blue-600 dark:bg-blue-700 text-white rounded-lg 
                                       hover:bg-blue-700 dark:hover:bg-blue-800 transition-all 
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                       flex items-center justify-center gap-2 font-medium"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCcw className="w-5 h-5 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-5 h-5" />
                                        Analyze File
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-full xl:flex-grow overflow-hidden">
                    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg h-full border border-zinc-200 dark:border-zinc-700">
                        <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 
                                    text-white rounded-t-xl border-b border-blue-700 dark:border-blue-800 
                                    flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                <h2 className="text-lg font-semibold">Analysis Results</h2>
                            </div>
                            <div className="text-sm bg-blue-500/30 px-4 py-1.5 rounded-full flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                {fileName !== 'No file selected' ? fileName : 'No file'}
                            </div>
                        </div>
                        <div className="flex flex-col h-[calc(100%-4rem)]">
                            <div className="flex-1 min-h-[400px] max-h-[800px] ">
                                <div className="p-6 bg-zinc-50 dark:bg-zinc-900 h-full">
                                    {!isLoading ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-4">
                                            <RefreshCcw className="w-8 h-8 text-blue-500 animate-spin" />
                                            <p className="text-zinc-600 dark:text-zinc-400">{guidance}</p>
                                        </div>
                                    ) : (
                                        <div className="relative overfolow-y-auto">
                                            {/* <ResultsViewer result={result} /> */}
                                            {
                                                guidance && (
                                                    <div className={`
                                                    mt-4 p-4 rounded-xl border flex items-center gap-3
                                                    ${analysisStatus === 'success'
                                                            ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                                                            : analysisStatus === 'error'
                                                                ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                                                                : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                                                        }
                                                `}>
                                                        <StatusIcon />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{guidance}</p>
                                                            {analysisStatus === 'success' && (
                                                                <p className="text-xs mt-1 text-green-600 dark:text-green-400">
                                                                    Analysis completed successfully
                                                                </p>
                                                            )}
                                                            {analysisStatus === 'error' && (
                                                                <p className="text-xs mt-1 text-red-600 dark:text-red-400">
                                                                    Please try again or contact support if the issue persists
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 
                                        bg-white dark:bg-zinc-800 rounded-b-xl
                                        text-xs text-zinc-500 dark:text-zinc-400">
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        <span>Version: {selectedVersion}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>Time: {new Date().toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>Date: {new Date().toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Dump