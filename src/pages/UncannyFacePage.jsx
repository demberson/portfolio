import { useEffect, useMemo, useState } from 'react';
import '../styles/UncannyFace.css';

const DEFAULT_API_BASE = 'http://127.0.0.1:8000';

function UncannyFacePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [outputImage, setOutputImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const apiBase = useMemo(
    () => (import.meta.env.VITE_UNCANNY_API_URL || DEFAULT_API_BASE).replace(/\/$/, ''),
    []
  );

  const onFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setOutputImage('');
    setError('');
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const runDetector = async () => {
    if (!selectedFile) {
      setError('Upload a photo first.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${apiBase}/transform`, {
        method: 'POST',
        body: formData,
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.detail || 'Unable to process image.');
      }

      if (!body?.image_base64) {
        throw new Error('The server returned an invalid response.');
      }

      setOutputImage(`data:image/png;base64,${body.image_base64}`);
    } catch {
      setError('Failed to process image.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="uncanny-page">
      <div className="uncanny-container">
        <h2>Uncanny Face Filter</h2>

        <div className="uncanny-controls">
          <input type="file" accept="image/*" onChange={onFileSelect} />
          <button type="button" onClick={runDetector} disabled={isLoading || !selectedFile}>
            {isLoading ? 'Processing...' : 'Generate Uncanny Output'}
          </button>
        </div>

        {error && <p className="uncanny-error">{error}</p>}

        <div className="uncanny-results">
          <article className="uncanny-result-card">
            <h3>Input</h3>
            {previewUrl ? (
              <img src={previewUrl} alt="Uploaded preview" />
            ) : (
              <p className="uncanny-placeholder">Choose an image to preview it here.</p>
            )}
          </article>

          <article className="uncanny-result-card">
            <h3>Output</h3>
            {outputImage ? (
              <img src={outputImage} alt="Uncanny face output" />
            ) : (
              <p className="uncanny-placeholder">Run the detector to see the transformed image.</p>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}

export default UncannyFacePage;
