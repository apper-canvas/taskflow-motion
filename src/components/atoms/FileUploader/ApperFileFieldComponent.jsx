import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/utils/cn';
import { ApperIcon } from '@/components/ApperIcon';
import { Button } from '@/components/atoms/Button';
import { toast } from 'react-toastify';

const ApperFileFieldComponent = ({
  fieldKey,
  existingFiles = [],
  onFilesChange,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  className = '',
  disabled = false,
  showPreview = true,
  multiple = true
}) => {
  // State management
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  // Refs for component lifecycle and cleanup
  const isMountedRef = useRef(true);
  const fileFieldInstanceRef = useRef(null);
  const elementIdRef = useRef(`apper-file-field-${fieldKey}-${Date.now()}`);
  const existingFilesRef = useRef(existingFiles);
  const sdkCheckAttemptsRef = useRef(0);
  const maxSdkAttempts = 50;
  const sdkCheckInterval = 5000; // 5 seconds

  // Generate unique element ID
  const elementId = elementIdRef.current;

  // Memoized existing files to prevent unnecessary re-renders
  const memoizedExistingFiles = useMemo(() => {
    if (!existingFiles || !Array.isArray(existingFiles)) {
      return [];
    }
    
    // Check if files actually changed by comparing length and first file's ID
    const hasChanged = 
      existingFiles.length !== existingFilesRef.current.length ||
      (existingFiles.length > 0 && existingFilesRef.current.length > 0 && 
       (existingFiles[0]?.id || existingFiles[0]?.Id) !== (existingFilesRef.current[0]?.id || existingFilesRef.current[0]?.Id));
    
    if (hasChanged) {
      existingFilesRef.current = existingFiles;
    }
    
    return existingFiles;
  }, [existingFiles?.length, existingFiles?.[0]?.id || existingFiles?.[0]?.Id]);

  // Single useEffect for SDK availability, mounting, and file updates
  useEffect(() => {
    let timeoutId;
    let intervalId;

    const checkSDKAndInitialize = async () => {
      try {
        // Check if component is still mounted
        if (!isMountedRef.current) return;

        // Check SDK availability
        if (!window.ApperSDK) {
          sdkCheckAttemptsRef.current += 1;
          
          if (sdkCheckAttemptsRef.current >= maxSdkAttempts) {
            const errorMsg = 'ApperSDK not loaded after maximum attempts. Please ensure the SDK script is included before this component.';
            console.error(errorMsg);
            if (isMountedRef.current) {
              setError(errorMsg);
              setIsReady(false);
            }
            return;
          }

          // Schedule next check
          timeoutId = setTimeout(checkSDKAndInitialize, sdkCheckInterval);
          return;
        }

        // SDK is available, check if FileField exists
        if (!window.ApperSDK.FileField) {
          const errorMsg = 'FileField not found in ApperSDK. Please ensure you have the correct SDK version.';
          console.error(errorMsg);
          if (isMountedRef.current) {
            setError(errorMsg);
            setIsReady(false);
          }
          return;
        }

        // Initialize FileField if not already done
        if (!fileFieldInstanceRef.current && isMountedRef.current) {
          try {
            const fileFieldInstance = new window.ApperSDK.FileField({
              elementId: elementId,
              fieldKey: fieldKey,
              multiple: multiple,
              maxFiles: maxFiles,
              maxFileSize: maxFileSize,
              acceptedTypes: acceptedTypes.join(','),
              onFilesChange: handleFileFieldChange,
              onUploadProgress: handleUploadProgress,
              onError: handleFileFieldError
            });

            fileFieldInstanceRef.current = fileFieldInstance;
            
            if (isMountedRef.current) {
              setIsReady(true);
              setError(null);
            }

            // Handle existing files after FileField is ready
            await handleExistingFilesUpdate();
            
          } catch (initError) {
            console.error('Error initializing FileField:', initError);
            if (isMountedRef.current) {
              setError(`Failed to initialize file upload: ${initError.message}`);
              setIsReady(false);
            }
          }
        }

      } catch (error) {
        console.error('Error in SDK check and initialization:', error);
        if (isMountedRef.current) {
          setError(`Initialization error: ${error.message}`);
          setIsReady(false);
        }
      }
    };

    const handleExistingFilesUpdate = async () => {
      if (!isReady || !fileFieldInstanceRef.current || !fieldKey) return;

      try {
        // Handle existing files changes
        if (memoizedExistingFiles.length === 0) {
          // Clear files if existingFiles is empty
          if (isMountedRef.current) {
            setFiles([]);
          }
          return;
        }

        // Check if files need format conversion
        const needsConversion = memoizedExistingFiles.some(file => 
          !file.hasOwnProperty('uiFormat') && (file.hasOwnProperty('url') || file.hasOwnProperty('downloadUrl'))
        );

        if (needsConversion) {
          const convertedFiles = await convertApiToUiFormat(memoizedExistingFiles);
          if (isMountedRef.current) {
            setFiles(convertedFiles);
            // Update FileField with converted files
            if (fileFieldInstanceRef.current?.updateFiles) {
              fileFieldInstanceRef.current.updateFiles(convertedFiles);
            }
          }
        } else {
          if (isMountedRef.current) {
            setFiles(memoizedExistingFiles);
          }
        }

      } catch (error) {
        console.error('Error handling existing files update:', error);
        if (isMountedRef.current) {
          setError(`Error processing existing files: ${error.message}`);
        }
      }
    };

    // Start SDK check
    checkSDKAndInitialize();

    // Cleanup function
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };

  }, [elementId, fieldKey, memoizedExistingFiles, isReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      // Clear refs and state
      if (fileFieldInstanceRef.current) {
        try {
          if (fileFieldInstanceRef.current.destroy) {
            fileFieldInstanceRef.current.destroy();
          }
        } catch (error) {
          console.error('Error destroying FileField instance:', error);
        }
        fileFieldInstanceRef.current = null;
      }

      // Clear state
      setFiles([]);
      setError(null);
      setUploadProgress({});
      setIsReady(false);
    };
  }, []);

  // File format conversion functions
  const convertApiToUiFormat = async (apiFiles) => {
    if (!Array.isArray(apiFiles)) return [];
    
    return apiFiles.map(file => ({
      id: file.id || file.Id || Date.now() + Math.random(),
      name: file.name || file.fileName || 'Unknown file',
      url: file.url || file.downloadUrl || '',
      size: file.size || 0,
      type: file.type || file.mimeType || 'application/octet-stream',
      lastModified: file.lastModified || file.modifiedOn || Date.now(),
      uploadStatus: 'completed',
      uiFormat: true
    }));
  };

  const convertUiToApiFormat = (uiFiles) => {
    if (!Array.isArray(uiFiles)) return [];
    
    return uiFiles.map(file => ({
      Id: file.id,
      fileName: file.name,
      downloadUrl: file.url,
      size: file.size,
      mimeType: file.type,
      modifiedOn: file.lastModified
    }));
  };

  // Event handlers
  const handleFileFieldChange = async (updatedFiles) => {
    if (!isMountedRef.current) return;

    try {
      setFiles(updatedFiles);
      
      // Notify parent component
      if (onFilesChange) {
        const apiFormatFiles = convertUiToApiFormat(updatedFiles);
        onFilesChange(apiFormatFiles);
      }
    } catch (error) {
      console.error('Error handling file field change:', error);
      handleFileFieldError(error);
    }
  };

  const handleUploadProgress = (progressData) => {
    if (!isMountedRef.current) return;
    
    setUploadProgress(prev => ({
      ...prev,
      [progressData.fileId]: progressData.progress
    }));
  };

  const handleFileFieldError = (error) => {
    if (!isMountedRef.current) return;

    console.error('FileField error:', error);
    setError(error.message || 'An error occurred with file operations');
    toast.error(error.message || 'File operation failed');
  };

  // File operations
  const handleFileSelect = async (event) => {
    if (!isReady || !fileFieldInstanceRef.current || disabled) return;

    const selectedFiles = Array.from(event.target.files || []);
    
    if (selectedFiles.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      // Validate file count
      if (!multiple && selectedFiles.length > 1) {
        throw new Error('Multiple files not allowed');
      }

      if (files.length + selectedFiles.length > maxFiles) {
        throw new Error(`Maximum ${maxFiles} files allowed`);
      }

      // Validate file sizes and types
      for (const file of selectedFiles) {
        if (file.size > maxFileSize) {
          throw new Error(`File "${file.name}" exceeds maximum size of ${Math.round(maxFileSize / (1024 * 1024))}MB`);
        }

        const isValidType = acceptedTypes.some(type => {
          if (type.includes('/')) {
            return file.type.match(type.replace('*', '.*'));
          }
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        });

        if (!isValidType) {
          throw new Error(`File type not allowed for "${file.name}"`);
        }
      }

      // Upload files through FileField
      if (fileFieldInstanceRef.current.uploadFiles) {
        await fileFieldInstanceRef.current.uploadFiles(selectedFiles);
      } else {
        // Fallback: add files to state directly
        const newFiles = selectedFiles.map(file => ({
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          file: file,
          uploadStatus: 'pending'
        }));

        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);
        
        if (onFilesChange) {
          const apiFormatFiles = convertUiToApiFormat(updatedFiles);
          onFilesChange(apiFormatFiles);
        }
      }

      toast.success(`${selectedFiles.length} file(s) uploaded successfully`);

    } catch (error) {
      console.error('Error selecting files:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileRemove = async (fileId) => {
    if (!isReady || !fileFieldInstanceRef.current || disabled) return;

    try {
      setLoading(true);
      
      if (fileFieldInstanceRef.current.removeFile) {
        await fileFieldInstanceRef.current.removeFile(fileId);
      } else {
        // Fallback: remove from state
        const updatedFiles = files.filter(file => file.id !== fileId);
        setFiles(updatedFiles);
        
        if (onFilesChange) {
          const apiFormatFiles = convertUiToApiFormat(updatedFiles);
          onFilesChange(apiFormatFiles);
        }
      }

      toast.success('File removed successfully');

    } catch (error) {
      console.error('Error removing file:', error);
      toast.error(`Failed to remove file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return 'Image';
    if (fileType.includes('pdf')) return 'FileText';
    if (fileType.includes('word') || fileType.includes('document')) return 'FileText';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'Sheet';
    return 'File';
  };

  // Render error state
  if (error && !isReady) {
    return (
      <div className={cn('p-4 border-2 border-dashed border-red-300 rounded-lg bg-red-50', className)}>
        <div className="text-center">
          <ApperIcon name="AlertCircle" size={48} className="mx-auto text-red-500 mb-2" />
          <p className="text-red-700 font-medium mb-1">File Upload Error</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Render loading state
  if (!isReady) {
    return (
      <div className={cn('p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading file upload component...</p>
          <p className="text-gray-500 text-sm mt-1">
            Attempt {sdkCheckAttemptsRef.current} of {maxSdkAttempts}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* File Upload Area */}
      <div 
        id={elementId}
        className={cn(
          'border-2 border-dashed rounded-lg transition-colors duration-200',
          disabled 
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-primary-400 cursor-pointer',
          error ? 'border-red-300 bg-red-50' : 'bg-gray-50 hover:bg-gray-100'
        )}
      >
        <label className="block p-6 cursor-pointer">
          <input
            type="file"
            multiple={multiple}
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            disabled={disabled || loading}
            className="hidden"
          />
          
          <div className="text-center">
            <ApperIcon 
              name={loading ? 'Loader2' : 'Upload'} 
              size={48} 
              className={cn(
                'mx-auto mb-2',
                loading ? 'animate-spin text-primary-500' : 'text-gray-400',
                disabled && 'text-gray-300'
              )}
            />
            <p className={cn(
              'text-sm font-medium mb-1',
              disabled ? 'text-gray-400' : 'text-gray-700'
            )}>
              {loading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </p>
            <p className={cn(
              'text-xs',
              disabled ? 'text-gray-300' : 'text-gray-500'
            )}>
              Max {maxFiles} files, {formatFileSize(maxFileSize)} each
            </p>
            {acceptedTypes.length > 0 && (
              <p className={cn(
                'text-xs mt-1',
                disabled ? 'text-gray-300' : 'text-gray-400'
              )}>
                Supported: {acceptedTypes.join(', ')}
              </p>
            )}
          </div>
        </label>
      </div>

      {/* Error Display */}
      {error && isReady && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <ApperIcon name="AlertCircle" size={16} className="text-red-500 mr-2" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Files ({files.length}/{maxFiles})
          </h4>
          
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <ApperIcon 
                  name={getFileIcon(file.type)} 
                  size={20} 
                  className="text-gray-500 flex-shrink-0" 
                />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    {file.uploadStatus && (
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        file.uploadStatus === 'completed' && 'bg-green-100 text-green-800',
                        file.uploadStatus === 'pending' && 'bg-yellow-100 text-yellow-800',
                        file.uploadStatus === 'failed' && 'bg-red-100 text-red-800'
                      )}>
                        {file.uploadStatus}
                      </span>
                    )}
                  </div>
                  
                  {/* Progress bar */}
                  {uploadProgress[file.id] && uploadProgress[file.id] < 100 && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[file.id]}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-3">
                {/* Preview button */}
                {showPreview && file.url && file.type.startsWith('image/') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(file.url, '_blank')}
                    disabled={disabled}
                  >
                    <ApperIcon name="Eye" size={16} />
                  </Button>
                )}

                {/* Download button */}
                {file.url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = file.url;
                      link.download = file.name;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    disabled={disabled}
                  >
                    <ApperIcon name="Download" size={16} />
                  </Button>
                )}

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFileRemove(file.id)}
                  disabled={disabled || loading}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <ApperIcon name="Trash2" size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApperFileFieldComponent;