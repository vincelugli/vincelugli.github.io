import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';

// --- Styled Components ---

const PageContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h1`
  font-size: 2.8rem;
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #555;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  background-color: white;
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
`;

const SubmitButton = styled.button`
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover { background-color: #0056b3; }
  &:disabled {
    background-color: #a0c7e4;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.p<{ status: string }>`
  text-align: center;
  font-weight: 600;
  padding: 1rem;
  border-radius: 5px;
  color: white;
  background-color: ${({ status }) => status === 'success' ? '#28a745' : '#dc3545'};
`;

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
    <PageContainer>
      <Title>Tournament Sign-up</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="mainSummonerName">Main Account Summoner Name</Label>
          <Input id="mainSummonerName" name="mainSummonerName" type="text" value={formData.mainSummonerName} onChange={handleChange} required />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="mainAccountRegion">Main Account Region</Label>
          <Select id="mainAccountRegion" name="mainAccountRegion" value={formData.mainAccountRegion} onChange={handleChange} required>
            <option value="NA">North America</option>
            <option value="EUW">Europe West</option>
            <option value="LAN">Latin American North</option>
            <option value="LAS">Latin American South</option>
            <option value="Other">Other</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="location">Location (Timezone)</Label>
          <Select id="location" name="location" value={formData.location} onChange={handleChange} required>
            <option value="PST">Pacific (PST)</option>
            <option value="MST">Mountain (MST)</option>
            <option value="CST">Central (CST)</option>
            <option value="EST">Eastern (EST)</option>
            <option value="Other">Other</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="role">Role</Label>
          <Select id="role" name="role" value={formData.role} onChange={handleChange} required>
            <option value="Player">Player</option>
            <option value="Sub">Sub</option>
            <option value="Coach">Coach</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="peakRank">Peak Rank</Label>
          <Input id="peakRank" name="peakRank" type="text" value={formData.peakRank} onChange={handleChange} required />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="peakRankSeason">Peak Rank Season</Label>
          <Input id="peakRankSeason" name="peakRankSeason" type="text" value={formData.peakRankSeason} onChange={handleChange} required />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="altSummonerNames">Alternate Account Summoner Names (comma-separated)</Label>
          <TextArea id="altSummonerNames" name="altSummonerNames" value={formData.altSummonerNames} onChange={handleChange} />
        </FormGroup>

        <SubmitButton type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Submitting...' : 'Submit Sign-up'}
        </SubmitButton>

        {status === 'success' && <StatusMessage status="success">Sign-up successful! Thank you.</StatusMessage>}
        {status === 'error' && <StatusMessage status="error">Something went wrong. Please try again.</StatusMessage>}
      </Form>
    </PageContainer>
  );
};

export default SignUpPage;
