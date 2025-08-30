import { supabase } from '@/lib/supabase';

export interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
}

export interface RequiredProfileFields {
  full_name: string;
  phone: string;
  company_name: string;
  license_number: string;
  specializations: string[];
  experience_years: number;
  bio: string;
  profile_image: string;
  cover_image: string;
}

export async function checkProfileCompletion(userId: string): Promise<ProfileCompletionStatus> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      return {
        isComplete: false,
        missingFields: ['profile'],
        completionPercentage: 0
      };
    }

    const requiredFields: (keyof RequiredProfileFields)[] = [
      'full_name',
      'phone', 
      'company_name',
      'license_number',
      'specializations',
      'experience_years',
      'bio',
      'profile_image',
      'cover_image'
    ];

    const missingFields: string[] = [];
    let completedFields = 0;

    requiredFields.forEach(field => {
      const value = profile[field];
      
      if (field === 'specializations') {
        if (!value || !Array.isArray(value) || value.length === 0) {
          missingFields.push(field);
        } else {
          completedFields++;
        }
      } else if (field === 'experience_years') {
        if (value === null || value === undefined || value === 0) {
          missingFields.push(field);
        } else {
          completedFields++;
        }
      } else if (field === 'profile_image' || field === 'cover_image') {
        if (!value || value.trim() === '') {
          missingFields.push(field);
        } else {
          completedFields++;
        }
      } else {
        if (!value || value.trim() === '') {
          missingFields.push(field);
        } else {
          completedFields++;
        }
      }
    });

    const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);
    const isComplete = missingFields.length === 0;

    return {
      isComplete,
      missingFields,
      completionPercentage
    };
  } catch (error) {
    console.error('Error checking profile completion:', error);
    return {
      isComplete: false,
      missingFields: ['error'],
      completionPercentage: 0
    };
  }
}

export async function markProfileAsCompleted(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        profile_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error marking profile as completed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking profile as completed:', error);
    return false;
  }
}

export function getFieldDisplayName(field: string): string {
  const fieldNames: Record<string, string> = {
    full_name: 'Full Name',
    phone: 'Phone Number',
    company_name: 'Company Name',
    license_number: 'License Number',
    specializations: 'Specializations',
    experience_years: 'Years of Experience',
    bio: 'Bio/Description',
    profile_image: 'Profile Photo',
    cover_image: 'Cover Image'
  };

  return fieldNames[field] || field;
}
