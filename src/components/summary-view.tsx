import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Download, Gamepad2, FileText, Brain, Lightbulb, Users, Calendar, Tag } from 'lucide-react';

interface SummaryViewProps {
  onPageChange: (page: string) => void;
}

export function SummaryView({ onPageChange }: SummaryViewProps) {
  const [selectedNote] = useState({
    title: "Strategic Management Framework",
    date: "September 16, 2025",
    originalContent: `Strategic Management and Competitive Advantage

Introduction to Strategic Management
Strategic management is the process of formulating, implementing, and evaluating strategies that enable an organization to achieve its objectives. It involves analyzing the competitive environment, setting strategic direction, and coordinating resources to gain sustainable competitive advantage.

Strategic Management Process
The strategic management process consists of several interconnected phases:
1. Environmental Analysis - Examining external opportunities and threats
2. Internal Analysis - Assessing organizational strengths and weaknesses
3. Strategy Formulation - Developing strategic alternatives and selecting the best approach
4. Strategy Implementation - Executing the chosen strategy through organizational structure and processes
5. Strategy Evaluation - Monitoring performance and making necessary adjustments

SWOT Analysis Framework:
- Strengths: Internal capabilities that provide competitive advantage
- Weaknesses: Internal limitations that may hinder performance
- Opportunities: External factors that the organization can exploit
- Threats: External factors that could negatively impact the organization

Porter's Five Forces Model:
Michael Porter identified five competitive forces that shape industry structure:
1. Threat of New Entrants: Barriers to entry and potential for new competitors
2. Bargaining Power of Suppliers: Supplier concentration and switching costs
3. Bargaining Power of Buyers: Customer concentration and price sensitivity
4. Threat of Substitute Products: Alternative solutions and customer switching likelihood
5. Competitive Rivalry: Intensity of competition among existing firms

Generic Competitive Strategies:
Porter also outlined three generic strategies for competitive advantage:
- Cost Leadership: Achieving the lowest costs in the industry
- Differentiation: Creating unique value propositions for customers
- Focus Strategy: Targeting specific market segments with cost or differentiation advantages

Strategic Implementation:
Successful strategy implementation requires:
- Organizational structure aligned with strategy
- Appropriate resource allocation
- Performance management systems
- Corporate culture that supports strategic objectives
- Effective leadership and change management

Key Performance Indicators (KPIs) for strategic success include market share growth, profitability metrics, customer satisfaction scores, and operational efficiency measures.`,

    summary: {
      keyNames: [
        { name: "SWOT Analysis", description: "Framework for analyzing Strengths, Weaknesses, Opportunities, and Threats" },
        { name: "Porter's Five Forces", description: "Model analyzing competitive forces in an industry" },
        { name: "Cost Leadership", description: "Strategy focused on achieving lowest costs in the industry" },
        { name: "Differentiation", description: "Strategy creating unique value propositions for customers" },
        { name: "KPIs", description: "Key Performance Indicators used to measure strategic success" }
      ],
      definitions: [
        {
          term: "Strategic Management",
          definition: "The process of formulating, implementing, and evaluating strategies that enable an organization to achieve its objectives and gain competitive advantage."
        },
        {
          term: "Competitive Advantage",
          definition: "A condition or circumstance that puts a company in a favorable or superior business position compared to its rivals."
        },
        {
          term: "Environmental Analysis",
          definition: "The systematic examination of external factors that may impact an organization's strategic decisions and performance."
        },
        {
          term: "Barriers to Entry",
          definition: "Obstacles that make it difficult for new companies to enter a particular market or industry."
        },
        {
          term: "Focus Strategy",
          definition: "A competitive strategy that targets a specific, narrow segment of the market with specialized products or services."
        }
      ],
      keyInsights: [
        "Strategic management is an ongoing process that requires continuous monitoring and adjustment",
        "Sustainable competitive advantage comes from aligning internal capabilities with external opportunities",
        "SWOT and Porter's Five Forces are essential frameworks for strategic analysis",
        "Successful strategy implementation requires organizational alignment and strong leadership",
        "Different competitive strategies (cost leadership, differentiation, focus) suit different market conditions"
      ]
    },
    tags: ["Management", "Strategy", "Porter", "SWOT", "Competitive Advantage"]
  });

  const handleExport = (format: string) => {
    // Simulate file download
    const element = document.createElement('a');
    const file = new Blob([`Tate Studies Summary - ${selectedNote.title}\n\nGenerated on ${selectedNote.date}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${selectedNote.title}_summary.${format.toLowerCase()}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex-1 flex animate-fade-in">
      {/* Original Notes Panel */}
      <div className="w-1/2 p-8 border-r border-border">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Original Notes</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{selectedNote.date}</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[--neon-blue]" />
                {selectedNote.title}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {selectedNote.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-[--neon-blue]/30">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4 text-sm leading-relaxed">
                  {selectedNote.originalContent.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-foreground/90">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Summary Panel */}
      <div className="w-1/2 p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold gradient-text">AI Summary</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Brain className="h-4 w-4 text-[--neon-purple]" />
                <span>Processed with AI intelligence</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleExport('PDF')}
                className="border-[--neon-blue]/30 hover:bg-[--neon-blue]/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                onClick={() => onPageChange('flashcards')}
                className="bg-gradient-to-r from-[--neon-green] to-[--neon-blue] hover:from-[--neon-green]/80 hover:to-[--neon-blue]/80 text-white"
              >
                <Gamepad2 className="h-4 w-4 mr-2" />
                Generate Flashcards
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Key Names */}
            <Card className="border-[--neon-blue]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[--neon-blue]">
                  <Users className="h-5 w-5" />
                  Key Names & Concepts
                </CardTitle>
                <CardDescription>
                  Important terms and concepts identified in your notes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedNote.summary.keyNames.map((item, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-[--neon-blue]/20 transition-colors px-3 py-1"
                      title={item.description}
                    >
                      {item.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Definitions */}
            <Card className="border-[--neon-purple]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[--neon-purple]">
                  <FileText className="h-5 w-5" />
                  Definitions
                </CardTitle>
                <CardDescription>
                  Key terms and their meanings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {selectedNote.summary.definitions.map((def, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left hover:text-[--neon-purple]">
                        {def.term}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {def.definition}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card className="border-[--neon-green]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[--neon-green]">
                  <Lightbulb className="h-5 w-5" />
                  Key Insights
                </CardTitle>
                <CardDescription>
                  Important takeaways and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedNote.summary.keyInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-[--neon-green]/5 rounded-lg border border-[--neon-green]/20">
                      <div className="w-2 h-2 bg-[--neon-green] rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>
                  Save your summary in different formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleExport('MD')}
                    className="flex-1"
                  >
                    Markdown
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExport('TXT')}
                    className="flex-1"
                  >
                    Text File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}