import { CHILE_PLACE_ID } from '../constants';
import type { Bird, BirdDetails } from '../types';

const INATURALIST_API_BASE = 'https://api.inaturalist.org/v1';

export class INaturalistApi {
  private async fetchWithRetry(endpoint: string, params: Record<string, any> = {}, retries = 3): Promise<any> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const url = `${INATURALIST_API_BASE}${endpoint}?${queryParams.toString()}`;
    let lastError: Error | null = null;
    let attempt = 0;
    
    while (attempt < retries) {
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          if (response.status === 429) {
            const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            attempt++;
            continue;
          }
          
          throw new Error(await this.getErrorMessage(response));
        }

        const data = await response.json();
        
        if (!data || typeof data !== 'object') {
          throw new Error('Respuesta inválida del servidor');
        }

        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Error desconocido');
        
        if (attempt === retries - 1) {
          console.error('Error en la petición:', {
            url,
            params,
            error: lastError.message
          });
          throw new Error(`Error al obtener datos: ${lastError.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        attempt++;
      }
    }

    throw lastError || new Error('Error desconocido en la petición');
  }

  private async getErrorMessage(response: Response): Promise<string> {
    try {
      const data = await response.json();
      if (data && data.error) return data.error;
    } catch {
      // Si no podemos leer el JSON, usamos mensajes por defecto
    }

    switch (response.status) {
      case 404: return 'No se encontraron datos para esta consulta';
      case 400: return 'Solicitud inválida';
      case 500: return 'Error en el servidor de iNaturalist';
      default: return `Error ${response.status}: ${response.statusText}`;
    }
  }

  private getPhotoUrl(photo: any): string | null {
    if (!photo) return null;
    
    // Intentar obtener la URL en diferentes formatos
    const possibleUrls = [
      photo.url,
      photo.medium_url,
      photo.photo?.url,
      photo.photo?.medium_url
    ].filter(Boolean);

    // Usar la primera URL válida encontrada
    const url = possibleUrls[0];
    return url ? url.replace('square', 'medium') : null;
  }

  private validateObservation(obs: any): boolean {
    try {
      return Boolean(
        obs &&
        typeof obs === 'object' &&
        typeof obs.id === 'number' &&
        obs.taxon &&
        typeof obs.taxon === 'object' &&
        typeof obs.taxon.id === 'number' &&
        typeof obs.taxon.name === 'string' &&
        Array.isArray(obs.photos) &&
        obs.photos.length > 0
      );
    } catch {
      return false;
    }
  }

  private async getSoundData(taxonId: number): Promise<Array<{
    id: number;
    url: string;
    attribution?: string;
    type?: string;
    description?: string;
  }>> {
    try {
      const data = await this.fetchWithRetry('/observations', {
        taxon_id: taxonId,
        sounds: true,
        per_page: 10,
        order_by: 'observed_on',
        order: 'desc',
        quality_grade: 'research,needs_id'
      });

      if (!data.results) return [];

      return data.results
        .filter(obs => obs.sounds && obs.sounds.length > 0)
        .flatMap(obs => 
          obs.sounds.map(sound => ({
            id: sound.id,
            url: sound.file_url,
            attribution: sound.attribution,
            type: this.determineSoundType(sound),
            description: sound.description
          }))
        );
    } catch (error) {
      console.error('Error fetching sounds:', error);
      return [];
    }
  }

  private determineSoundType(sound: any): string {
    const filename = sound.file_url?.toLowerCase() || '';
    const description = sound.description?.toLowerCase() || '';
    
    if (
      description.includes('song') || 
      description.includes('canto') ||
      filename.includes('song') ||
      filename.includes('canto')
    ) {
      return 'song';
    }
    
    return 'call';
  }

  async getBirds(params: {
    per_page?: number;
    page?: number;
    order?: string;
    order_by?: string;
    q?: string;
  } = {}): Promise<Bird[]> {
    try {
      const requestParams = {
        iconic_taxa: 'Aves',
        quality_grade: 'research,needs_id',
        locale: 'es',
        per_page: params.per_page || 50,
        order_by: params.order_by || 'votes',
        order: params.order || 'desc',
        photos: true,
        place_id: CHILE_PLACE_ID,
        view: 'species', // Always group by species
        ...params
      };

      const data = await this.fetchWithRetry('/observations', requestParams);

      if (!data || !Array.isArray(data.results)) {
        throw new Error('Formato de respuesta inválido');
      }

      const validObservations = data.results
        .filter(obs => this.validateObservation(obs))
        .map(obs => {
          try {
            return {
              id: obs.id,
              species: {
                id: obs.taxon.id,
                name: obs.taxon.name,
                commonName: obs.taxon.preferred_common_name || obs.taxon.name,
                conservationStatus: obs.taxon.conservation_status?.status,
                endemic: Boolean(obs.taxon.endemic),
                native: Boolean(obs.taxon.native),
                introduced: Boolean(obs.taxon.introduced),
                threatened: Boolean(obs.taxon.threatened)
              },
              location: {
                latitude: obs.latitude || 0,
                longitude: obs.longitude || 0,
                placeGuess: obs.place_guess || 'Ubicación no especificada',
                region: obs.place_guess || 'Región no especificada'
              },
              photos: obs.photos
                .map(photo => {
                  const url = this.getPhotoUrl(photo);
                  return url ? {
                    url,
                    attribution: photo.attribution || photo.photo?.attribution || 'Autor desconocido'
                  } : null;
                })
                .filter(Boolean),
              observedOn: obs.observed_on || new Date().toISOString().split('T')[0],
              quality: obs.quality_grade || 'needs_id',
              votes: obs.votes || 0,
              observationsCount: obs.observations_count || 0
            };
          } catch (error) {
            console.error('Error al procesar observación:', error);
            return null;
          }
        })
        .filter((bird): bird is Bird => bird !== null && bird.photos.length > 0);

      if (validObservations.length === 0) {
        throw new Error('No se encontraron observaciones válidas');
      }

      return validObservations;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al obtener observaciones: ${message}`);
    }
  }

  async getBirdDetails(taxonId: number): Promise<BirdDetails> {
    try {
      const [taxonData, observationsData, sounds] = await Promise.all([
        this.fetchWithRetry(`/taxa/${taxonId}`, {
          locale: 'es'
        }),
        this.fetchWithRetry('/observations', {
          taxon_id: taxonId,
          per_page: 10,
          order_by: 'observed_on',
          order: 'desc',
          photos: true,
          sounds: true,
          place_id: CHILE_PLACE_ID,
          quality_grade: 'research,needs_id'
        }),
        this.getSoundData(taxonId)
      ]);

      if (!taxonData.results?.[0]) {
        throw new Error('Especie no encontrada');
      }

      const taxon = taxonData.results[0];
      const observations = observationsData.results
        .map(obs => ({
          id: obs.id,
          location: {
            latitude: obs.latitude || 0,
            longitude: obs.longitude || 0,
            placeGuess: obs.place_guess || 'Ubicación no especificada',
            region: obs.place_guess || 'Región no especificada'
          },
          photos: obs.photos
            .map(photo => {
              const url = this.getPhotoUrl(photo);
              return url ? {
                url,
                attribution: photo.attribution || photo.photo?.attribution || 'Autor desconocido'
              } : null;
            })
            .filter(Boolean),
          sounds: obs.sounds?.map(sound => ({
            url: sound.file_url,
            attribution: sound.attribution,
            type: this.determineSoundType(sound)
          })) || [],
          observedOn: obs.observed_on || new Date().toISOString().split('T')[0],
          quality: obs.quality_grade || 'needs_id'
        }))
        .filter(obs => obs.photos.length > 0);

      return {
        id: taxon.id,
        name: taxon.name,
        commonName: taxon.preferred_common_name || taxon.name,
        wikipediaSummary: taxon.wikipedia_summary,
        wikipediaUrl: taxon.wikipedia_url,
        conservationStatus: taxon.conservation_status?.status,
        endemic: Boolean(taxon.endemic),
        native: Boolean(taxon.native),
        introduced: Boolean(taxon.introduced),
        threatened: Boolean(taxon.threatened),
        defaultPhoto: this.getPhotoUrl(taxon.default_photo),
        sounds,
        observations
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error al obtener detalles: ${message}`);
    }
  }
}