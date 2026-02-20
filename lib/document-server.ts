import mammoth from "mammoth"

/**
 * Extracts plain text from a .docx file buffer using mammoth.
 * This is used to pipe Word document content into Gemini's text input.
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
    try {
        const result = await mammoth.extractRawText({ buffer })
        return result.value
    } catch (error) {
        console.error("Error extracting text from DOCX:", error)
        throw new Error("Failed to extract text from .docx file")
    }
}
