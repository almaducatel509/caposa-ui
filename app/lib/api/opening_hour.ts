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
    return response.data;
  } catch (error) {
    console.error("Error fetching opening hours:", error);
    return [];
  }
};

// Function to create new opening hours
export const createOpeningHours = async (openingHoursData: OpeningHoursAPI) => {
  try {
    const response = await AxiosInstance.post('opening-hours/', openingHoursData);
    return response.data;
  } catch (error: any) {
    console.error('API error:', error);
    throw error;
  }
};

// Function to update opening hours
export const updateOpeningHours = async (id: string, openingHoursData: OpeningHoursAPI) => {
  try {
    if (!id) {
      throw new Error("ID missing for opening hours update");
    }
    
    const response = await AxiosInstance.put(`opening-hours/${id}/`, openingHoursData);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating opening hours ${id}:`, error);
    throw error;
  }
};

// Function to delete opening hours
export const deleteOpeningHours = async (id: string): Promise<void> => {
  try {
    await AxiosInstance.delete(`/opening-hours/${id}`);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'horaire :', error);
    throw error;
  }
};
