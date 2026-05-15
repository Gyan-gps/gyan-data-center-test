import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { formatDate } from './formatters'

export interface ExportOptions {
  filename?: string
  sheetName?: string
}

export const exportToCSV = (data: Record<string, unknown>[], options: ExportOptions = {}) => {
  const { filename = `data_export_${formatDate(new Date(), 'yyyy-MM-dd_HH-mm-ss')}` } = options
  
  const csv = Papa.unparse(data, {
    header: true,
    skipEmptyLines: true
  })
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `${filename}.csv`)
}

export const exportToExcel = (data: Record<string, unknown>[], options: ExportOptions = {}) => {
  const { 
    filename = `data_export_${formatDate(new Date(), 'yyyy-MM-dd_HH-mm-ss')}`,
    sheetName = 'Data'
  } = options
  
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  
  // Auto-fit column widths
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  const colWidths: number[] = []
  
  for (let col = range.s.c; col <= range.e.c; col++) {
    let maxWidth = 10
    for (let row = range.s.r; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      const cell = ws[cellAddress]
      if (cell && cell.v) {
        const cellValue = cell.v.toString()
        maxWidth = Math.max(maxWidth, cellValue.length)
      }
    }
    colWidths[col] = Math.min(maxWidth + 2, 50) // Cap at 50 characters
  }
  
  ws['!cols'] = colWidths.map(width => ({ width }))
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })
  
  downloadBlob(blob, `${filename}.xlsx`)
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export const getExportFilename = (dataType: string, filters?: Record<string, unknown>) => {
  const timestamp = formatDate(new Date(), 'yyyy-MM-dd')
  let filename = `${dataType}_${timestamp}`
  
  if (filters) {
    const filterStrings = Object.entries(filters)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${key}-${value}`)
      .join('_')
    
    if (filterStrings) {
      filename += `_${filterStrings}`
    }
  }
  
  return filename
}
