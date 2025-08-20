'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/addpage/PageHeader';
import { navigateToHome } from '@/utils/navigation';

export default function EditTab() {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    code: ''
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setFormData({
      title: urlParams.get('title') || '',
      instructions: urlParams.get('instructions') || '',
      code: urlParams.get('code') || ''
    });
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const urlParams = new URLSearchParams({
      action: 'edit',
      id: String(params.id),
      title: formData.title,
      instructions: formData.instructions,
      code: formData.code
    });
    router.push(`/?${urlParams.toString()}`);
  };

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleDelete = () => {
    const urlParams = new URLSearchParams({
      action: 'delete',
      id: String(params.id)
    });
    router.push(`/?${urlParams.toString()}`);
  }

  const handleBack = () => {
    navigateToHome(router);
  };

  return (
    <div className="bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Edit Tab"
          subtitle="Update your code snippet and instructions"
          onBack={handleBack}
        />

        <Card>
          <CardHeader>
            <CardTitle>Tab Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="space-y-2">
                <Label htmlFor="title">Tab Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleChange('title')}
                  placeholder="Enter tab title..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={handleChange('instructions')}
                  rows={6}
                  placeholder="Enter instructions..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Textarea
                  id="code"
                  value={formData.code}
                  onChange={handleChange('code')}
                  rows={10}
                  placeholder="Enter your code..."
                  className="font-mono text-sm"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit">
                  Update
                </Button>

                <Button type='button' variant={'destructive'}
                onClick={handleDelete}>
                    <span><Trash2/></span>
                    <span>Delete</span>
                </Button>

                <Button type="button" variant="outline"
                  onClick={() => router.push('/')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}