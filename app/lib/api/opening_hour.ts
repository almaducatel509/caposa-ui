import AxiosInstance from '../axiosInstance';

// Interface for opening hours
export interface OpeningHoursAPI {
  id?: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday?: string | null;
  sunday?: string | null;
  status?: "active" | "paused" | "vacation";
}

// Function to fetch all opening hours
export const fetchOpeningHours = async (): Promise<OpeningHoursAPI[]> => {
  try {
    const response = await AxiosInstance.get('opening-hours/');
    console.log("Opening hours response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching opening hours:", error);
    throw error;
  }
};

// Function to create new opening hours
export const createOpeningHours = async (openingHoursData: OpeningHoursAPI) => {
  try {
    // Log request details for debugging
    console.log('Full URL:', `${AxiosInstance.defaults.baseURL}opening-hours/`);
    console.log('Data being sent:', openingHoursData);
    
    const response = await AxiosInstance.post('opening-hours/', openingHoursData);
    console.log('API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('API error:', error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

// Function to update opening hours
export const updateOpeningHours = async (id: string, openingHoursData: OpeningHoursAPI) => {
  try {
    if (!id) {
      throw new Error("ID missing for opening hours update");
    }
    
    console.log(`Updating opening hours with ID: ${id}`);
    console.log('Full URL:', `${AxiosInstance.defaults.baseURL}opening-hours/${id}/`);
    console.log('Data being sent:', openingHoursData);
    
    const response = await AxiosInstance.put(`opening-hours/${id}/`, openingHoursData);
    console.log('API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating opening hours ${id}:`, error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

// Function to delete opening hours
export const deleteOpeningHours = async (id: string): Promise<void> => {
  try {
    await AxiosInstance.delete(`/opening-hours/${id}`);
    console.log(`Horaire avec ID ${id} supprimé avec succès.`);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'horaire :', error);
    throw error; // important pour déclencher l'onError ou catch plus haut
  }
};