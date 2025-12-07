"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { extractDomain, getEmailProvider, isValidEmailFormat, parseEmailList } from '@/lib/utils/email-provider';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  multiple?: boolean; // Support pour plusieurs emails (CC)
  className?: string;
  disabled?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

export default function EmailInput({
  value,
  onChange,
  placeholder = "destinataire@example.com",
  label,
  multiple = false,
  className = "",
  disabled = false,
  onValidationChange
}: EmailInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<Record<string, { valid: boolean; provider: ReturnType<typeof getEmailProvider> }>>({});
  const validationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Fonction pour valider un email
  const validateEmail = async (email: string): Promise<{ valid: boolean; provider: ReturnType<typeof getEmailProvider> }> => {
    // Validation du format
    if (!isValidEmailFormat(email)) {
      return { valid: false, provider: null };
    }

    const domain = extractDomain(email);
    const provider = getEmailProvider(domain);

    // Pour l'instant, on considère qu'un email avec un format valide est valide
    // Vous pouvez ajouter une vérification côté serveur ici si nécessaire
    return { valid: true, provider };
  };

  // Valider les emails quand la valeur change
  useEffect(() => {
    // Nettoyer le timeout précédent
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    if (!value || value.trim() === '') {
      setValidationResults({});
      onValidationChange?.(true);
      return;
    }

    setIsValidating(true);

    // Délai de debounce pour éviter trop de validations
    validationTimeoutRef.current = setTimeout(async () => {
      if (multiple) {
        // Mode multiple : valider chaque email
        const emails = parseEmailList(value);
        const results: Record<string, { valid: boolean; provider: ReturnType<typeof getEmailProvider> }> = {};

        for (const email of emails) {
          const result = await validateEmail(email);
          results[email] = result;
        }

        setValidationResults(results);
        const allValid = emails.length > 0 && emails.every(email => results[email]?.valid);
        onValidationChange?.(allValid);
      } else {
        // Mode simple : valider un seul email
        const result = await validateEmail(value);
        setValidationResults({ [value]: result });
        onValidationChange?.(result.valid);
      }

      setIsValidating(false);
    }, 500);

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [value, multiple, onValidationChange]);

  // Obtenir le résultat de validation pour un email spécifique
  const getValidationResult = (email: string) => {
    if (multiple) {
      const emails = parseEmailList(value);
      return validationResults[email] || { valid: false, provider: null };
    }
    return validationResults[value] || { valid: false, provider: null };
  };

  // Obtenir l'email actuel (pour mode simple) ou tous les emails (pour mode multiple)
  const getCurrentEmails = (): string[] => {
    if (multiple) {
      return parseEmailList(value);
    }
    return value ? [value] : [];
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2.5 pr-24 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-[14px] bg-white dark:bg-gray-800 text-black dark:text-white ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          autoFocus={!multiple}
        />
        
        {/* Indicateur de validation */}
        {value && value.trim() !== '' && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isValidating ? (
              <Loader2 size={18} className="animate-spin text-gray-400" />
            ) : (
              <>
                {(() => {
                  if (multiple) {
                    const emails = parseEmailList(value);
                    const allValid = emails.length > 0 && emails.every(email => {
                      const result = getValidationResult(email);
                      return result.valid;
                    });
                    const allInvalid = emails.length > 0 && emails.every(email => {
                      const result = getValidationResult(email);
                      return !result.valid;
                    });

                    if (allValid && emails.length > 0) {
                      return (
                        <div className="flex items-center gap-1.5">
                          <Check size={16} className="text-green-500" />
                          <span className="text-[11px] text-green-600 dark:text-green-400 font-medium">{emails.length}</span>
                        </div>
                      );
                    } else if (allInvalid && emails.length > 0) {
                      return (
                        <div className="flex items-center gap-1.5">
                          <X size={16} className="text-red-500" />
                          <span className="text-[11px] text-red-600 dark:text-red-400 font-medium">{emails.length}</span>
                        </div>
                      );
                    }
                    return null;
                  } else {
                    const result = getValidationResult(value);
                    if (result.valid) {
                      return (
                        <div className="flex items-center gap-2">
                          {result.provider && (
                            <div 
                              className="flex items-center justify-center w-6 h-6 rounded-full text-white text-[11px] font-bold shadow-sm"
                              style={{ backgroundColor: result.provider.color }}
                              title={result.provider.name}
                            >
                              {result.provider.logoContent}
                            </div>
                          )}
                          <Check size={18} className="text-green-500" />
                        </div>
                      );
                    } else if (value.trim() !== '' && !isValidEmailFormat(value)) {
                      return <X size={18} className="text-red-500" />;
                    }
                    return null;
                  }
                })()}
              </>
            )}
          </div>
        )}
      </div>

      {/* Affichage des tags pour mode multiple (CC) */}
      {multiple && value && parseEmailList(value).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {parseEmailList(value).map((email, index) => {
            const result = getValidationResult(email);
            const domain = extractDomain(email);
            const provider = result.provider || getEmailProvider(domain);

            return (
              <div
                key={index}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] border max-w-[220px] ${
                  result.valid
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                }`}
              >
                {result.valid && provider && (
                  <div 
                    className="flex items-center justify-center w-4 h-4 rounded-full text-white text-[9px] font-bold flex-shrink-0"
                    style={{ backgroundColor: provider.color }}
                    title={provider.name}
                  >
                    {provider.logoContent}
                  </div>
                )}
                <span className="truncate flex-1 min-w-0">{email}</span>
                {result.valid ? (
                  <Check size={12} className="text-green-500 flex-shrink-0" />
                ) : (
                  <X size={12} className="text-red-500 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Aide pour mode multiple */}
      {multiple && (
        <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1">
          Séparez les adresses par des virgules ou des points-virgules
        </p>
      )}
    </div>
  );
}

