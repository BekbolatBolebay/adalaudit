import mammoth from "mammoth"
import { performAdvancedOCR } from "./ocr-service"

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

/**
 * Extracts text from PDF or DOCX using advanced OCR if available.
 */
export async function extractEnhancedContent(fileData: string, fileName: string, mediaType: string): Promise<string> {
    // Try advanced OCR first
    const enhancedText = await performAdvancedOCR(fileData, mediaType)
    if (enhancedText) return enhancedText

    // Fallback to basic extraction
    if (mediaType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileName.endsWith(".docx")) {
        const buffer = Buffer.from(fileData, "base64")
        return extractTextFromDocx(buffer)
    }

    // For PDF, basic fallback might be empty if no specific parser is installed
    // Gemini handles raw PDF data well, so we often send it directly.
    return ""
}
