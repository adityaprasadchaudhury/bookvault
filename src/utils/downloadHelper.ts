/**
 * Securely triggers download of an authenticated and verified book purchase
 */
export async function downloadPurchasedBook(
  bookId: string,
  bookTitle: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = localStorage.getItem('bv_token');
    if (!token) {
      return { success: false, error: 'Authentication required. Please log in first.' };
    }

    const response = await fetch(`/api/books/${bookId}/download`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to download book.';
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.error || errorMessage;
      } catch {
        errorMessage = `Server returned HTTP status ${response.status}`;
      }
      return { success: false, error: errorMessage };
    }

    // Read the binary stream as a blob
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    // Create a temporary link element to trigger browser file download
    const link = document.createElement('a');
    link.href = blobUrl;
    const safeTitle = bookTitle.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
    link.download = `${safeTitle}.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up memory
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);

    return { success: true };
  } catch (err: any) {
    console.error('Download error:', err);
    return { success: false, error: err.message || 'Network error while downloading file.' };
  }
}
