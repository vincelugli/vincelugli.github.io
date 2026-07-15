import React, { useState, useCallback } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  SignUpPageContainer,
  SignUpPageTitle,
  SignUpPageForm,
  SignUpPageFormGroup,
  SignUpPageLabel,
  SignUpPageInput,
  SignUpPageSelect,
  SignUpPageTextArea,
  SignUpPageSubmitButton,
  SignUpPageStatusMessage,
} from '../../styles';

// --- Component Definition ---

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const initialFormData = {
  mainSummonerName: '',
  mainAccountRegion: '',
  location: 'PST',
  role: 'Player' as const,
  peakRank: '',
  peakRankSeason: '',
  altSummonerNames: '',
};

const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [status, setStatus] = useState<FormStatus>('idle');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields: (keyof typeof initialFormData)[] = [
      'mainSummonerName',
      'location',
      'role',
      'peakRank',
      'peakRankSeason'
    ];
    
    // Find the first field that is empty or just whitespace
    const missingField = requiredFields.find(field => !formData[field]?.trim());
    if (missingField) {
      // Provide a more user-friendly alert
      alert(`Please fill out the "${missingField.replace(/([A-Z])/g, ' $1')}" field.`);
      return;
    }
    setStatus('loading');

    try {
      const dataToSubmit = {
        ...formData,
        submittedAt: Timestamp.now(),
      };
      
      const signupsCollection = collection(db, 'signups');
      await addDoc(signupsCollection, dataToSubmit);
      
      setStatus('success');
      setFormData(initialFormData); // Reset form on success
    } catch (error) {
      console.error("Error submitting sign-up:", error);
      setStatus('error');
    }
  }, [formData]);

  return (
    <SignUpPageContainer>
      <SignUpPageTitle>Tournament Sign-up</SignUpPageTitle>
      <SignUpPageForm onSubmit={handleSubmit}>
        <SignUpPageFormGroup>
          <SignUpPageLabel htmlFor="mainSummonerName">Main Account Summoner Name</SignUpPageLabel>
          <SignUpPageInput id="mainSummonerName" name="mainSummonerName" type="text" value={formData.mainSummonerName} onChange={handleChange} required />
        </SignUpPageFormGroup>
        <SignUpPageFormGroup>
          <SignUpPageLabel htmlFor="mainAccountRegion">Main Account Region</SignUpPageLabel>
          <SignUpPageSelect id="mainAccountRegion" name="mainAccountRegion" value={formData.mainAccountRegion} onChange={handleChange} required>
            <option value="NA">North America</option>
            <option value="EUW">Europe West</option>
            <option value="LAN">Latin American North</option>
            <option value="LAS">Latin American South</option>
            <option value="Other">Other</option>
          </SignUpPageSelect>
        </SignUpPageFormGroup>

        <SignUpPageFormGroup>
          <SignUpPageLabel htmlFor="location">Location (Timezone)</SignUpPageLabel>
          <SignUpPageSelect id="location" name="location" value={formData.location} onChange={handleChange} required>
            <option value="PST">Pacific (PST)</option>
            <option value="MST">Mountain (MST)</option>
            <option value="CST">Central (CST)</option>
            <option value="EST">Eastern (EST)</option>
            <option value="Other">Other</option>
          </SignUpPageSelect>
        </SignUpPageFormGroup>

        <SignUpPageFormGroup>
          <SignUpPageLabel htmlFor="role">Role</SignUpPageLabel>
          <SignUpPageSelect id="role" name="role" value={formData.role} onChange={handleChange} required>
            <option value="Player">Player</option>
            <option value="Sub">Sub</option>
            <option value="Coach">Coach</option>
          </SignUpPageSelect>
        </SignUpPageFormGroup>

        <SignUpPageFormGroup>
          <SignUpPageLabel htmlFor="peakRank">Peak Rank</SignUpPageLabel>
          <SignUpPageInput id="peakRank" name="peakRank" type="text" value={formData.peakRank} onChange={handleChange} required />
        </SignUpPageFormGroup>

        <SignUpPageFormGroup>
          <SignUpPageLabel htmlFor="peakRankSeason">Peak Rank Season</SignUpPageLabel>
          <SignUpPageInput id="peakRankSeason" name="peakRankSeason" type="text" value={formData.peakRankSeason} onChange={handleChange} required />
        </SignUpPageFormGroup>

        <SignUpPageFormGroup>
          <SignUpPageLabel htmlFor="altSummonerNames">Alternate Account Summoner Names (comma-separated)</SignUpPageLabel>
          <SignUpPageTextArea id="altSummonerNames" name="altSummonerNames" value={formData.altSummonerNames} onChange={handleChange} />
        </SignUpPageFormGroup>

        <SignUpPageSubmitButton type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Submitting...' : 'Submit Sign-up'}
        </SignUpPageSubmitButton>

        {status === 'success' && <SignUpPageStatusMessage status="success">Sign-up successful! Thank you.</SignUpPageStatusMessage>}
        {status === 'error' && <SignUpPageStatusMessage status="error">Something went wrong. Please try again.</SignUpPageStatusMessage>}
      </SignUpPageForm>
    </SignUpPageContainer>
  );
};

export default SignUpPage;
