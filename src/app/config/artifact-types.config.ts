import { InjectionToken } from '@angular/core';
import { ArtifactType } from '../models/artefacto.model';

export interface ArtifactTypesConfiguration {
  enableRemoteArtifactTypes: boolean;
  localArtifactTypes: ArtifactType[];
}

export const ARTIFACT_TYPES_CONFIGURATION =
  new InjectionToken<ArtifactTypesConfiguration>('ARTIFACT_TYPES_CONFIGURATION');
