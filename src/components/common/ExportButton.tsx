import React from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button, Spinner } from '@/components/ui'
import { useExport } from '@/hooks'
import { cn } from '@/utils/cn'
import { trackFileDownload } from '@/utils/ga'
import { useAuthStore } from '@/store/authStore'

interface ExportButtonProps {
  data: Record<string, unknown>[]
  format: 'csv' | 'excel'
  dataType?: string
  filename?: string
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  format,
  dataType = 'data',
  filename,
  disabled = false,
  className,
  size = 'md',
  variant = 'outline'
}) => {
  const { isExporting, exportData, canExport } = useExport()
  const { user } = useAuthStore()

  const handleExport = async () => {
    try {
      const request = {
        data: dataType as "datacenters" | "companies" | "itload",
        format,
      };
      
      await exportData(request);
      
      // Track file download
      if (user) {
        trackFileDownload(
          user.id.toString(),
          user.email,
          filename || `${dataType}_export`,
          format
        );
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  }

  const isDisabled = disabled || !canExport || isExporting || !data.length

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isDisabled}
      onClick={handleExport}
      className={cn('gap-2', className)}
    >
      {isExporting ? (
        <Spinner className="w-4 h-4" />
      ) : format === 'excel' ? (
        <FileSpreadsheet className="w-4 h-4" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      Export {format.toUpperCase()}
    </Button>
  )
}

interface ExportButtonGroupProps {
  data: Record<string, unknown>[]
  dataType?: string
  filename?: string
  disabled?: boolean
  className?: string
}

export const ExportButtonGroup: React.FC<ExportButtonGroupProps> = ({
  data,
  dataType = 'data',
  filename,
  disabled = false,
  className
}) => {
  const { canExport } = useExport()

  if (!canExport) {
    return (
      <div className={cn('flex gap-2', className)}>
        <Button 
          variant="outline" 
          disabled 
          className="gap-2 opacity-50"
          onClick={() => toast.error('Upgrade your subscription to download data')}
        >
          <Download className="w-4 h-4" />
          Export Data
        </Button>
        <p className="text-xs text-gray-500 self-center">
          Upgrade to download
        </p>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <ExportButton
        data={data}
        format="csv"
        dataType={dataType}
        filename={filename}
        disabled={disabled}
      />
      <ExportButton
        data={data}
        format="excel"
        dataType={dataType}
        filename={filename}
        disabled={disabled}
      />
    </div>
  )
}
