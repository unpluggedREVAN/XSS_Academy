import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, Code, HelpCircle } from 'lucide-react';
import { theorySections } from '../data/theory';
import { MarkdownRenderer } from './MarkdownRenderer';

export function TheoryView() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['intro']));

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : '';
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Teoría de XSS</h1>
            <p className="text-gray-400">Guía completa sobre Cross-Site Scripting</p>
          </div>
        </div>

        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
          <p className="text-gray-300">
            Esta sección contiene todo lo que necesitas saber sobre XSS, desde los fundamentos
            hasta técnicas avanzadas. Lee cada sección cuidadosamente antes de intentar los laboratorios.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {theorySections.sort((a, b) => a.order - b.order).map((section) => {
          const isExpanded = expandedSections.has(section.id);

          return (
            <div key={section.id} className="bg-gray-800 rounded-lg border border-gray-700">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-blue-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                    {!isExpanded && (
                      <p className="text-gray-400 text-sm mt-1">{section.content.slice(0, 100)}...</p>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">#{section.order}</span>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 space-y-6">
                  <p className="text-gray-300 leading-relaxed">{section.content}</p>

                  {section.subsections && section.subsections.length > 0 && (
                    <div className="space-y-6">
                      {section.subsections.map((subsection, idx) => (
                        <div key={idx} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                          <h3 className="text-xl font-semibold text-blue-400 mb-4">
                            {subsection.title}
                          </h3>

                          <MarkdownRenderer content={subsection.content} />

                          {subsection.videoUrl && (
                            <div className="my-6">
                              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">VIDEO</span>
                                  {subsection.videoTitle}
                                </h4>
                                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                  <iframe
                                    src={getYouTubeEmbedUrl(subsection.videoUrl)}
                                    title={subsection.videoTitle}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {subsection.codeExamples && subsection.codeExamples.length > 0 && (
                            <div className="space-y-4 my-6">
                              {subsection.codeExamples.map((example, exIdx) => (
                                <div key={exIdx} className="bg-gray-950 rounded-lg border border-gray-700 overflow-hidden">
                                  <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center gap-2">
                                    <Code className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm font-semibold text-white">{example.title}</span>
                                  </div>
                                  {example.explanation && (
                                    <div className="px-4 py-3 bg-gray-900 border-b border-gray-700">
                                      <p className="text-sm text-gray-300">{example.explanation}</p>
                                    </div>
                                  )}
                                  <div className="p-4">
                                    <pre className="text-sm text-gray-300 overflow-x-auto font-mono">
                                      <code>{example.code}</code>
                                    </pre>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {subsection.exercises && subsection.exercises.length > 0 && (
                            <div className="space-y-3 my-6">
                              <div className="flex items-center gap-2 mb-3">
                                <HelpCircle className="w-5 h-5 text-yellow-400" />
                                <h4 className="text-lg font-semibold text-white">Ejercicios de Práctica</h4>
                              </div>
                              {subsection.exercises.map((exercise, exIdx) => (
                                <details key={exIdx} className="bg-gray-800 rounded-lg border border-gray-700">
                                  <summary className="px-4 py-3 cursor-pointer hover:bg-gray-750 transition-colors">
                                    <span className="text-gray-300">{exercise.question}</span>
                                  </summary>
                                  <div className="px-4 py-3 border-t border-gray-700 bg-green-900/20">
                                    <p className="text-sm text-gray-300 font-mono">{exercise.answer}</p>
                                  </div>
                                </details>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
