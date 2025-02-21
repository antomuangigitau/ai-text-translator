/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { CircleX } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
declare global {
  interface Window {
    ai: any;
  }
}

function App() {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<
    {
      text: string;
      detectedLanguage?: string;
      showTranslationOptions: boolean;
      translation?: string;
    }[]
  >([]);
  const [targetLanguage, setTargetLanguage] = useState("fr");
  const [isLanguageDetectionSupported, setIsLanguageDetectionSupported] =
    useState(false);

  const supportedLanguages = [
    { code: "en", name: "English" },
    { code: "pt", name: "Portuguese" },
    { code: "es", name: "Spanish" },
    { code: "ru", name: "Russian" },
    { code: "tr", name: "Turkish" },
    { code: "fr", name: "French" },
  ];

  useEffect(() => {
    const checkLanguageDetectionSupport = async () => {
      if (!("ai" in self) || !("languageDetector" in self.ai)) {
        setIsLanguageDetectionSupported(false);
        return;
      }

      const capabilities = await self.ai.languageDetector.capabilities();
      if (capabilities.capabilities === "no") {
        setIsLanguageDetectionSupported(false);
      } else {
        setIsLanguageDetectionSupported(true);
      }
    };

    checkLanguageDetectionSupport();
  }, []);

  const handleSend = async () => {
    if (userInput.trim()) {
      let detectedLanguage = "unknown";

      if (isLanguageDetectionSupported) {
        const detector = await self.ai.languageDetector.create();
        const result = await detector.detect(userInput.trim());
        detectedLanguage = result[0].detectedLanguage;
      }

      setMessages([
        ...messages,
        {
          text: userInput,
          detectedLanguage,
          showTranslationOptions: true,
          translation: undefined,
        },
      ]);
      setUserInput("");
    }
  };

  const handleTranslate = async (index: number) => {
    const message = messages[index];

    if (!("ai" in self) || !("translator" in self.ai)) {
      toast("Translation API is not supported in this browser.");
      return;
    }

    try {
      const translatorCapabilities = await self.ai.translator.capabilities();
      const languagePairAvailability =
        translatorCapabilities.languagePairAvailable(
          message.detectedLanguage || "en",
          targetLanguage
        );

      if (languagePairAvailability === "no") {
        toast.error(
          `Translation from ${message.detectedLanguage} to ${targetLanguage} is not supported.`
        );
        return;
      }

      const translator = await self.ai.translator.create({
        sourceLanguage: message.detectedLanguage || "en",
        targetLanguage: targetLanguage,
      });

      const translatedText = await translator.translate(message.text);

      const updatedMessages = [...messages];
      updatedMessages[index] = {
        ...updatedMessages[index],
        translation: `Translated (${targetLanguage}): ${translatedText}`,
        showTranslationOptions: false,
      };

      setMessages(updatedMessages);
    } catch {
      toast.error("An error occurred during translation. Please try again.");
    }
  };

  return (
    <>
      <div className="bg-[#dadbd3] h-screen grid place-items-center">
        <div className="bg-[#ededed] h-[90vh] w-[90vw] sm:w-[50vw] shadow-lg rounded-lg flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {messages.map((message, index) => (
              <div key={index} className="flex flex-col gap-2">
                <div className="bg-blue-100 p-3 rounded-lg shadow-sm max-w-[70%] self-end">
                  {message.text}
                  {message.detectedLanguage && (
                    <p className="text-xs text-gray-500 mt-1">
                      Detected Language: {message.detectedLanguage}
                    </p>
                  )}
                </div>

                {message.showTranslationOptions && (
                  <div className="bg-gray-100 p-3 rounded-lg shadow-sm max-w-[70%] self-end">
                    <p className="text-sm mb-2">Translate to:</p>
                    <select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-300 mb-2">
                      {supportedLanguages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name} ({lang.code})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleTranslate(index)}
                      className="bg-blue-500 text-white px-2 py-2 rounded-lg text-xs hover:bg-blue-600">
                      Translate
                    </button>
                  </div>
                )}

                {message.translation && (
                  <div className="bg-green-100 p-3 rounded-lg shadow-sm max-w-[70%] self-start">
                    {message.translation}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="px-3 md:px-10 pb-5 flex items-center gap-1 sm:gap-2.5">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full"
            />
            <button onClick={handleSend}>
              <SendHorizontal color="blue" size={32} />
            </button>
          </div>
        </div>
      </div>
      <Toaster
        position="top-center"
        icons={{
          error: <CircleX />,
        }}
      />
    </>
  );
}

export default App;
