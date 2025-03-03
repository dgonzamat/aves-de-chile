const EBIRD_API_BASE = 'https://api.ebird.org/v2';

export class EBirdApi {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetch(endpoint: string) {
    const response = await fetch(`${EBIRD_API_BASE}${endpoint}`, {
      headers: {
        'X-eBirdApiToken': this.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`eBird API error: ${response.status}`);
    }

    return response.json();
  }

  async getRecentObservationsInRegion(regionCode: string = 'CL', days: number = 7) {
    return this.fetch(`/data/obs/${regionCode}/recent?back=${days}`);
  }

  async getHotspots(regionCode: string = 'CL') {
    return this.fetch(`/ref/hotspot/${regionCode}`);
  }

  async getRecentObservationsAtHotspot(locId: string, days: number = 7) {
    return this.fetch(`/data/obs/${locId}/recent?back=${days}`);
  }

  async getNotableObservations(regionCode: string = 'CL') {
    return this.fetch(`/obs/${regionCode}/recent/notable`);
  }
}