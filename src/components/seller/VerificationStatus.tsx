'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield,
  CheckCircle2,
  AlertCircle,
  Upload,
  Phone,
  Mail,
  Building,
  IdCard,
  FileText
} from 'lucide-react';
import { Agent } from '@/lib/types';

interface VerificationStatusProps {
  agent: Agent;
}

export function VerificationStatus({ agent }: VerificationStatusProps) {
  const verificationSteps = [
    {
      id: 'email',
      title: 'Email Verification',
      description: 'Verify your email address',
      completed: agent.verification.emailVerified,
      icon: Mail,
      action: agent.verification.emailVerified ? null : 'Verify Email'
    },
    {
      id: 'phone',
      title: 'Phone Verification',
      description: 'Verify your phone number',
      completed: agent.verification.phoneVerified,
      icon: Phone,
      action: agent.verification.phoneVerified ? null : 'Verify Phone'
    },
    {
      id: 'identity',
      title: 'Identity Documents',
      description: 'Upload government-issued ID',
      completed: agent.agentProfile?.verificationDocuments?.includes('id') || false,
      icon: IdCard,
      action: agent.agentProfile?.verificationDocuments?.includes('id') ? null : 'Upload ID'
    },
    {
      id: 'license',
      title: 'Real Estate License',
      description: 'Upload valid RE license',
      completed: agent.agentProfile?.verificationDocuments?.includes('license') || false,
      icon: FileText,
      action: agent.agentProfile?.verificationDocuments?.includes('license') ? null : 'Upload License'
    },
    {
      id: 'company',
      title: 'Company Registration',
      description: 'Business registration documents',
      completed: agent.agentProfile?.verificationDocuments?.includes('company_registration') || false,
      icon: Building,
      action: agent.agentProfile?.verificationDocuments?.includes('company_registration') ? null : 'Upload Documents'
    }
  ];

  const completedSteps = verificationSteps.filter(step => step.completed).length;
  const totalSteps = verificationSteps.length;
  const completionPercentage = (completedSteps / totalSteps) * 100;

  const getVerificationLevel = () => {
    if (completionPercentage === 100) {
      return { level: 'Fully Verified', color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-200' };
    } else if (completionPercentage >= 60) {
      return { level: 'Partially Verified', color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-200' };
    } else {
      return { level: 'Verification Needed', color: 'text-amber-600', bgColor: 'bg-amber-100', borderColor: 'border-amber-200' };
    }
  };

  const verificationStatus = getVerificationLevel();

  return (
    <Card className={`${verificationStatus.bgColor} ${verificationStatus.borderColor}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className={`w-4 h-4 ${verificationStatus.color}`} />
          Verification Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Overall Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${verificationStatus.color}`}>
              {verificationStatus.level}
            </span>
            <span className="text-xs text-muted-foreground">
              {completedSteps}/{totalSteps}
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Verification Benefits */}
        {agent.agentProfile?.isVerified && (
          <div className="bg-white/50 rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Verified Agent Benefits</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Higher search ranking</li>
              <li>• Trust badge on listings</li>
              <li>• Access to premium features</li>
              <li>• Priority customer support</li>
            </ul>
          </div>
        )}

        {/* Verification Steps */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Verification Checklist
          </div>
          {verificationSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center gap-2 text-xs">
                {step.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${step.completed ? 'text-green-700' : 'text-muted-foreground'}`}>
                    {step.title}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {step.description}
                  </div>
                </div>
                {step.action && (
                  <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-auto">
                    {step.action}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {completionPercentage < 100 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Complete Verification
          </Button>
        )}

        {/* Support Contact */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Need help? Contact{' '}
          <a href="mailto:verification@akwaabahomes.com" className="text-primary hover:underline">
            verification support
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
