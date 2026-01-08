import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';

const AgeVerificationModal = ({ isOpen, onVerified, minAge = 18 }) => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Check if user already verified age
    const verified = localStorage.getItem('age_verified');
    if (verified === 'true') {
      onVerified();
    }
  }, [onVerified]);

  const handleVerify = () => {
    if (checked) {
      localStorage.setItem('age_verified', 'true');
      onVerified();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95" data-testid="age-verification-modal">
      <div className="relative glass rounded-2xl p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <Shield className="w-20 h-20 text-fuchsia-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            <span className="text-gradient">Age Verification Required</span>
          </h2>
          <p className="text-gray-300 mb-4">
            This website contains adult content. You must be at least {minAge} years old to access this site.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
            <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-gray-300">
              By continuing, you confirm that you are of legal age in your jurisdiction to view adult content.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 mb-6 text-left">
          <Checkbox
            id="age-confirm"
            checked={checked}
            onCheckedChange={setChecked}
            className="mt-1"
            data-testid="age-checkbox"
          />
          <label htmlFor="age-confirm" className="text-sm text-gray-300 cursor-pointer">
            I confirm that I am {minAge} years of age or older and I agree to view adult content. I understand that this website contains sexually explicit material.
          </label>
        </div>

        <Button
          onClick={handleVerify}
          disabled={!checked}
          className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white py-4 rounded-full hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="verify-age-button"
        >
          Enter Site
        </Button>

        <p className="text-xs text-gray-500 mt-4">
          This website uses cookies to verify your age. By clicking "Enter Site", you consent to our use of cookies.
        </p>
      </div>
    </div>
  );
};

export default AgeVerificationModal;
