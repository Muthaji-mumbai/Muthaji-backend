require('dotenv').config()
const path = require('path')
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')
const cloudinary = require('cloudinary').v2
const axios = require('axios')
const FormData = require('form-data')

// Local storage directory paths
const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads')
const IMAGES_DIR = path.join(UPLOADS_ROOT, 'images')
const PDFS_DIR = path.join(UPLOADS_ROOT, 'pdfs')
const TEMP_DIR = path.join(UPLOADS_ROOT, 'temp')

// Ensure uploads directories exist
const ensureDirectoriesExist = () => {
    [UPLOADS_ROOT, IMAGES_DIR, PDFS_DIR, TEMP_DIR].forEach((dir) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
    })
}
ensureDirectoriesExist()

// Storage driver: 'local' (default) or 'cloud'
const STORAGE_DRIVER = (process.env.STORAGE_DRIVER || 'local').toLowerCase()

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY
const supabaseBucket = process.env.SUPABASE_BUCKET
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null

// Cloudinary configuration
if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    })
}

const buildTimestampPrefix = () => {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const hh = String(now.getHours()).padStart(2, '0')
    const min = String(now.getMinutes()).padStart(2, '0')
    const ss = String(now.getSeconds()).padStart(2, '0')
    const ms = String(now.getMilliseconds()).padStart(3, '0')
    return `${yyyy}${mm}${dd}_${hh}${min}${ss}_${ms}`
}

const makeUniqueFileName = (inputFileName) => {
    const timestamp = buildTimestampPrefix()
    const ext = path.extname(inputFileName)
    const base = path.basename(inputFileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_')
    return `${timestamp}_${base}${ext}`
}

const uploadToImgBB = async (filePath) => {
    try {
        if (!process.env.IMGBB_API_KEY) {
            return null
        }

        const formData = new FormData()
        formData.append('image', fs.createReadStream(filePath))

        const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            formData,
            {
                headers: {
                    ...formData.getHeaders()
                }
            }
        )

        if (response.data && response.data.success && response.data.data) {
            return response.data.data.url
        }
        return null
    } catch (e) {
        console.error(`ImgBB upload failed: ${e.message}`)
        return null
    }
}

/**
 * Upload file to storage (local server disk or cloud)
 */
const uploadFileToStorage = async (filePath, options = {}) => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`)
        }

        const providedName = options.fileName || path.basename(filePath)
        const fileName = makeUniqueFileName(providedName)
        const ext = path.extname(fileName).toLowerCase()
        const isPdf = ext === '.pdf'

        let primaryUrl = ''
        let backupUrl = ''

        // 1. LOCAL SERVER STORAGE (Default / Recommended for Dokploy VPS)
        if (STORAGE_DRIVER === 'local' || (!supabase && !process.env.CLOUDINARY_CLOUD_NAME)) {
            ensureDirectoriesExist()

            const targetDir = isPdf ? PDFS_DIR : IMAGES_DIR
            const subFolder = isPdf ? 'pdfs' : 'images'
            const destPath = path.join(targetDir, fileName)

            // Copy file to permanent storage location
            fs.copyFileSync(filePath, destPath)

            // Remove temporary file if it was placed in temp or different location
            try {
                if (path.resolve(filePath) !== path.resolve(destPath)) {
                    fs.unlinkSync(filePath)
                }
            } catch (err) {
                // Ignore temp deletion errors
            }

            // Construct public URL
            const serverBaseUrl = (process.env.SERVER_URL || process.env.BASE_URL || '').replace(/\/+$/, '')
            primaryUrl = serverBaseUrl ? `${serverBaseUrl}/uploads/${subFolder}/${fileName}` : `/uploads/${subFolder}/${fileName}`

            // Optional ImgBB backup for images if key is provided
            if (!isPdf && process.env.IMGBB_API_KEY) {
                try {
                    const imgbb = await uploadToImgBB(destPath)
                    if (imgbb) backupUrl = imgbb
                } catch (e) { }
            }

            if (!backupUrl) {
                backupUrl = primaryUrl
            }

            return {
                url: primaryUrl,
                backupUrl: backupUrl
            }
        }

        // 2. CLOUD STORAGE (Supabase for PDFs, Cloudinary for Images)
        if (isPdf) {
            if (!supabase) {
                throw new Error('Supabase is not configured.')
            }

            const destinationPath = options.destinationPath || `pdfs/orders/${fileName}`
            const contentType = 'application/pdf'
            const fileBuffer = fs.readFileSync(filePath)

            const { error: uploadError } = await supabase.storage
                .from(supabaseBucket)
                .upload(destinationPath, fileBuffer, {
                    contentType,
                    upsert: false
                })

            if (uploadError) {
                throw uploadError
            }

            const { data: publicUrlData } = supabase.storage
                .from(supabaseBucket)
                .getPublicUrl(destinationPath)

            if (!publicUrlData || !publicUrlData.publicUrl) {
                throw new Error('Failed to get public URL from Supabase')
            }

            primaryUrl = publicUrlData.publicUrl
            backupUrl = ''
        } else {
            if (!process.env.CLOUDINARY_CLOUD_NAME) {
                throw new Error('Cloudinary is not configured.')
            }

            const destinationFolder = options.folder || 'soloshine_orders'

            const result = await cloudinary.uploader.upload(filePath, {
                folder: destinationFolder,
                resource_type: 'auto'
            })

            primaryUrl = result.secure_url

            try {
                const imgbbUrl = await uploadToImgBB(filePath)
                if (imgbbUrl) {
                    backupUrl = imgbbUrl
                }
            } catch (backupErr) {
                console.error('Backup upload to ImgBB failed:', backupErr.message)
            }
        }

        return {
            url: primaryUrl,
            backupUrl: backupUrl
        }

    } catch (e) {
        console.error('Error inside uploadFileToStorage:', e)
        const errorMsg = e.message || (e.error && e.error.message) || (typeof e === 'object' ? JSON.stringify(e) : String(e))
        throw new Error(`File upload failed: ${errorMsg}`)
    }
}

const extractCloudinaryPublicId = (url) => {
    try {
        const parts = url.split('/')
        const versionIndex = parts.findIndex(part => part.startsWith('v') && !isNaN(part.substring(1)))
        if (versionIndex !== -1 && versionIndex < parts.length - 1) {
            const pathParts = parts.slice(versionIndex + 1)
            const fileNameWithExt = pathParts.join('/')
            const extIndex = fileNameWithExt.lastIndexOf('.')
            return extIndex !== -1 ? fileNameWithExt.substring(0, extIndex) : fileNameWithExt
        }
    } catch (err) { }
    return null
}

/**
 * Delete files from storage (handles local server files, Supabase, and Cloudinary)
 */
const deleteFilesFromStorage = async (fileUrls) => {
    try {
        if (!fileUrls || fileUrls.length === 0) return

        for (const url of fileUrls) {
            try {
                if (!url) continue

                // 1. Delete local file from server
                if (url.includes('/uploads/')) {
                    const relativePart = url.split('/uploads/')[1].split('?')[0] // remove query params
                    const localFilePath = path.join(UPLOADS_ROOT, relativePart)
                    if (fs.existsSync(localFilePath)) {
                        fs.unlinkSync(localFilePath)
                    }
                }
                // 2. Delete Supabase file
                else if (url.includes('supabase.co')) {
                    if (supabase && supabaseBucket) {
                        const parts = url.split(`/public/${supabaseBucket}/`)
                        if (parts.length > 1) {
                            const pathToDelete = parts[1]
                            await supabase.storage.from(supabaseBucket).remove([pathToDelete])
                        }
                    }
                }
                // 3. Delete Cloudinary file
                else if (url.includes('cloudinary.com')) {
                    if (process.env.CLOUDINARY_API_KEY) {
                        const publicId = extractCloudinaryPublicId(url)
                        if (publicId) {
                            await cloudinary.uploader.destroy(publicId)
                        }
                    }
                }
            } catch (err) {
                console.error('Error deleting file:', err)
            }
        }
    } catch (e) {
        console.error(`File deletion failed: ${e.message}`)
    }
}

/**
 * Calculate directory size recursively
 */
const getFolderSizeRecursive = (dirPath) => {
    let totalSize = 0
    if (!fs.existsSync(dirPath)) return 0

    const items = fs.readdirSync(dirPath)
    for (const item of items) {
        const itemPath = path.join(dirPath, item)
        const stats = fs.statSync(itemPath)
        if (stats.isDirectory()) {
            totalSize += getFolderSizeRecursive(itemPath)
        } else {
            totalSize += stats.size
        }
    }
    return totalSize
}

/**
 * Get storage size stats (local server, Supabase, Cloudinary)
 */
const getStorageSizeStats = async (folderPath = '') => {
    try {
        let stats = {
            localBytes: 0,
            localMb: '0.00 MB',
            supabaseBytes: 0,
            cloudinaryBytes: 0
        }

        // Local Server Storage size
        try {
            ensureDirectoriesExist()
            stats.localBytes = getFolderSizeRecursive(UPLOADS_ROOT)
            stats.localMb = (stats.localBytes / (1024 * 1024)).toFixed(2) + ' MB'
        } catch (e) {
            console.error('Local storage stat error:', e)
        }

        // Supabase Storage size
        if (supabase && supabaseBucket) {
            const getSupabaseFolderSize = async (folder) => {
                let total = 0
                const { data, error } = await supabase.storage.from(supabaseBucket).list(folder, {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'name', order: 'asc' },
                })
                if (!error && data) {
                    for (const item of data) {
                        if (item.id === null && item.name !== '.emptyFolderPlaceholder') {
                            total += await getSupabaseFolderSize(folder ? `${folder}/${item.name}` : item.name)
                        } else if (item.metadata && item.metadata.size) {
                            total += item.metadata.size
                        }
                    }
                }
                return total
            }
            try {
                stats.supabaseBytes = await getSupabaseFolderSize(folderPath)
            } catch (e) { }
        }

        // Cloudinary Storage size
        if (process.env.CLOUDINARY_API_KEY) {
            try {
                const usage = await cloudinary.api.usage()
                stats.cloudinaryBytes = usage.storage && usage.storage.usage ? usage.storage.usage : 0
            } catch (e) { }
        }

        return stats
    } catch (e) {
        console.error(`Status check failed: ${e.message}`)
        return { localBytes: 0, localMb: '0.00 MB', supabaseBytes: 0, cloudinaryBytes: 0 }
    }
}

/**
 * Clean orphaned local server files that are no longer referenced in the database
 */
const cleanOrphanedLocalFiles = (activeUrls = []) => {
    try {
        ensureDirectoriesExist()
        const activeFileNames = new Set()

        activeUrls.forEach(url => {
            if (url && typeof url === 'string') {
                const fileName = path.basename(url.split('?')[0])
                if (fileName) activeFileNames.add(fileName)
            }
        })

        let deletedCount = 0
        let bytesFreed = 0

        const cleanDir = (dir) => {
            if (!fs.existsSync(dir)) return
            const files = fs.readdirSync(dir)
            for (const file of files) {
                const fullPath = path.join(dir, file)
                if (fs.statSync(fullPath).isFile()) {
                    if (!activeFileNames.has(file)) {
                        const size = fs.statSync(fullPath).size
                        fs.unlinkSync(fullPath)
                        deletedCount++
                        bytesFreed += size
                    }
                }
            }
        }

        cleanDir(IMAGES_DIR)
        cleanDir(PDFS_DIR)

        return {
            success: true,
            deletedCount,
            freedMb: (bytesFreed / (1024 * 1024)).toFixed(2) + ' MB'
        }
    } catch (e) {
        throw new Error(`Local file cleanup failed: ${e.message}`)
    }
}

const cleanOrphanedCloudinaryImages = async (activeImageUrls, startDate, endDate) => {
    try {
        if (!process.env.CLOUDINARY_API_KEY) {
            throw new Error('Cloudinary is not configured.')
        }

        const start = startDate ? new Date(startDate) : null
        const end = endDate ? new Date(endDate) : null

        const dbPublicIds = new Set()
        if (activeImageUrls && Array.isArray(activeImageUrls)) {
            activeImageUrls.forEach(url => {
                if (url && url.includes('cloudinary.com')) {
                    const publicId = extractCloudinaryPublicId(url)
                    if (publicId) {
                        dbPublicIds.add(publicId)
                    }
                }
            })
        }

        let nextCursor = null
        let orphanedPublicIds = []
        let totalChecked = 0

        do {
            const result = await cloudinary.api.resources({
                type: 'upload',
                prefix: 'soloshine_orders/',
                max_results: 500,
                next_cursor: nextCursor
            })

            if (result && result.resources) {
                totalChecked += result.resources.length
                for (const res of result.resources) {
                    if (!dbPublicIds.has(res.public_id)) {
                        const createdDate = new Date(res.created_at)
                        let matchesDateRange = true
                        if (start && createdDate < start) {
                            matchesDateRange = false
                        }
                        if (end && createdDate > end) {
                            matchesDateRange = false
                        }
                        if (matchesDateRange) {
                            orphanedPublicIds.push(res.public_id)
                        }
                    }
                }
                nextCursor = result.next_cursor
            } else {
                break
            }
        } while (nextCursor)

        let deletedCount = 0
        for (let i = 0; i < orphanedPublicIds.length; i += 100) {
            const chunk = orphanedPublicIds.slice(i, i + 100)
            const delResult = await cloudinary.api.delete_resources(chunk)
            if (delResult && delResult.deleted) {
                deletedCount += Object.keys(delResult.deleted).length
            }
        }

        return {
            success: true,
            totalChecked,
            orphanedCount: orphanedPublicIds.length,
            deletedCount
        }
    } catch (e) {
        throw new Error(`Cloudinary cleanup failed: ${e.message}`)
    }
}

module.exports = {
    uploadFileToStorage,
    deleteFilesFromStorage,
    getStorageSizeStats,
    cleanOrphanedLocalFiles,
    cleanOrphanedCloudinaryImages,
    UPLOADS_ROOT,
    IMAGES_DIR,
    PDFS_DIR
}
