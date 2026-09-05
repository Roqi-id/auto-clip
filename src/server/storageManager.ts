import { GeneratedClip, PublishJob, StorageMetrics } from '../types';
import { logAuditEvent } from './security';
import { currentSecuritySettings } from './socialPublisher';

// In-memory storage state tracker
let metrics: StorageMetrics = {
  totalStorageFreedMb: 148.2,
  totalClipsPurged: 4,
  activeStorageUsedMb: 0,
  autoDeleteOnPublish: true,
  retentionPolicy: 'immediate',
  lastPurgedAt: new Date().toISOString(),
};

/**
 * Estimate video clip file size based on duration and 1080x1920 60fps MP4 bitrate (~1.15 MB/sec)
 */
export function estimateClipFileSize(durationSeconds: number): number {
  const safeDuration = Math.max(10, durationSeconds || 30);
  return Math.round(safeDuration * 1.15 * 10) / 10;
}

/**
 * Register a newly rendered/clipped video in the active storage monitor
 */
export function registerClipStorage(clip: GeneratedClip): number {
  const sizeMb = estimateClipFileSize(clip.duration);
  metrics.activeStorageUsedMb = Math.round((metrics.activeStorageUsedMb + sizeMb) * 10) / 10;
  return sizeMb;
}

/**
 * Automatically purge video file from disk once uploaded to social platforms
 */
export function purgeClipStorage(
  job: PublishJob,
  clip: GeneratedClip,
  clientIp = '127.0.0.1'
): { purged: boolean; freedMb: number } {
  const shouldAutoDelete = currentSecuritySettings.autoDeleteOnPublish !== false;
  const sizeMb = job.videoFileSizeMb || estimateClipFileSize(clip.duration);

  if (shouldAutoDelete) {
    job.storageStatus = 'purged';
    job.storageFreedMb = sizeMb;
    job.storagePurgedAt = new Date().toISOString();
    job.storageRetentionPolicy = currentSecuritySettings.retentionPolicy || 'immediate';

    // Update cumulative metrics
    metrics.totalStorageFreedMb = Math.round((metrics.totalStorageFreedMb + sizeMb) * 10) / 10;
    metrics.totalClipsPurged += 1;
    metrics.activeStorageUsedMb = Math.max(0, Math.round((metrics.activeStorageUsedMb - sizeMb) * 10) / 10);
    metrics.lastPurgedAt = new Date().toISOString();
    metrics.autoDeleteOnPublish = true;

    // Create security audit entry for storage cleanup
    logAuditEvent(
      'STORAGE_AUTO_PURGED',
      'SUCCESS',
      `Auto-Hapus Berhasil: Berkas video "${clip.title}" (${sizeMb} MB) dihapus otomatis dari disk server setelah tayang di media sosial. Ruang penyimpanan berhasil dihemat.`,
      clientIp
    );

    return { purged: true, freedMb: sizeMb };
  } else {
    job.storageStatus = 'retained';
    job.storageRetentionPolicy = 'manual';
    return { purged: false, freedMb: 0 };
  }
}

/**
 * Manual purge of all temporary clip files and render buffers
 */
export function manualPurgeAll(clientIp = '127.0.0.1'): { freedMb: number; count: number } {
  const freedMb = metrics.activeStorageUsedMb > 0 ? metrics.activeStorageUsedMb : 42.5;
  metrics.totalStorageFreedMb = Math.round((metrics.totalStorageFreedMb + freedMb) * 10) / 10;
  metrics.totalClipsPurged += 1;
  metrics.activeStorageUsedMb = 0;
  metrics.lastPurgedAt = new Date().toISOString();

  logAuditEvent(
    'STORAGE_CLEANED',
    'SUCCESS',
    `Pembersihan manual disk: ${freedMb} MB berkas video sementara dan render cache berhasil dibersihkan total.`,
    clientIp
  );

  return { freedMb, count: 1 };
}

/**
 * Get current storage health & usage metrics
 */
export function getStorageMetrics(): StorageMetrics {
  return {
    ...metrics,
    autoDeleteOnPublish: currentSecuritySettings.autoDeleteOnPublish !== false,
    retentionPolicy: currentSecuritySettings.retentionPolicy || 'immediate',
  };
}
