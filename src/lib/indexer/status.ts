import { isBingWebmasterEnabled } from "@/lib/indexer/bing-webmaster";
import {
  getCronSecret,
  getIndexNowKey,
  getIndexNowKeyLocation,
  getIndexerOrigin,
  REFUND_AFTER_DAYS,
  RUN_BATCH_SIZE,
} from "@/lib/indexer/config";
import { isDiscoveryConfigured } from "@/lib/indexer/discover";
import { isGoogleIndexingEnabled } from "@/lib/indexer/google-indexing";
import {
  isBingVerificationEnabled,
  isGoogleVerificationEnabled,
  isVerificationEnabled,
} from "@/lib/indexer/verify";

export type IndexerStatus = {
  mode: "self-hosted";
  origin: string;
  indexnowKeyUrl: string | null;
  discoveryConfigured: boolean;
  indexnowConfigured: boolean;
  bingWebmasterConfigured: boolean;
  googleIndexingConfigured: boolean;
  cronConfigured: boolean;
  verificationEnabled: boolean;
  googleVerificationEnabled: boolean;
  bingVerificationEnabled: boolean;
  refundAfterDays: number;
  batchSize: number;
  ready: boolean;
  warnings: string[];
};

export function getIndexerStatus(): IndexerStatus {
  const warnings: string[] = [];

  if (!getIndexNowKey()) {
    warnings.push("INDEXNOW_KEY missing — IndexNow discovery disabled");
  }
  if (!isBingWebmasterEnabled()) {
    warnings.push("BING_WEBMASTER_API_KEY missing — Bing URL submission disabled");
  }
  if (!isGoogleIndexingEnabled()) {
    warnings.push("GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON missing — Google Indexing API disabled");
  }
  if (!getCronSecret()) {
    warnings.push("CRON_SECRET missing — cron queue will not run");
  }
  if (!isVerificationEnabled()) {
    warnings.push("Smart verification APIs not configured (optional)");
  }

  const discoveryConfigured = isDiscoveryConfigured();
  const cronConfigured = Boolean(getCronSecret());

  return {
    mode: "self-hosted",
    origin: getIndexerOrigin(),
    indexnowKeyUrl: getIndexNowKeyLocation(),
    discoveryConfigured,
    indexnowConfigured: Boolean(getIndexNowKey()),
    bingWebmasterConfigured: isBingWebmasterEnabled(),
    googleIndexingConfigured: isGoogleIndexingEnabled(),
    cronConfigured,
    verificationEnabled: isVerificationEnabled(),
    googleVerificationEnabled: isGoogleVerificationEnabled(),
    bingVerificationEnabled: isBingVerificationEnabled(),
    refundAfterDays: REFUND_AFTER_DAYS,
    batchSize: RUN_BATCH_SIZE,
    ready: discoveryConfigured && cronConfigured,
    warnings,
  };
}
