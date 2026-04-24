'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';

// FAQ data
const faqs = [
  {
    id: 1,
    question: 'What pricing plans do you offer?',
    answer:
      'We offer 6 flexible pricing plans ranging from our free Starter plan to Enterprise solutions. Each plan includes different character limits, voice options, and commercial usage rights. Check our Pricing section above for detailed information on each plan.',
  },
  {
    id: 2,
    question: 'How many languages and voices are supported?',
    answer:
      'SpeakStudio supports 50+ languages with 200+ premium AI voices. Our voices include various accents, ages, and tones to match your content needs. Higher-tier plans unlock access to more voice options and multilingual capabilities.',
  },
  {
    id: 3,
    question: 'Can I use the generated voices commercially?',
    answer:
      'Yes! All paid plans (Creator and above) include commercial usage rights. The Starter free plan is for personal use only. You can use generated audio in videos, podcasts, audiobooks, and any commercial projects with paid plans.',
  },
  {
    id: 4,
    question: 'What is the character limit and how does it work?',
    answer:
      'Each plan has a monthly character limit (e.g., 10K for Starter, up to 5M for Enterprise). Characters are counted from your input text. Unused characters do not roll over to the next month. You can upgrade anytime if you need more capacity.',
  },
  {
    id: 5,
    question: 'Do you offer API access for developers?',
    answer:
      'Yes! API access is available starting from the Studio plan (PKR 5,000/month). Our RESTful API allows you to integrate SpeakStudio into your applications with comprehensive documentation and SDKs for popular languages.',
  },
  {
    id: 6,
    question: 'How does voice cloning work?',
    answer:
      'Voice cloning is available on Pro, Agency, and Enterprise plans. Upload 5-10 minutes of clear audio recordings, and our AI will create a custom voice model. The process typically takes 24-48 hours, and you can use the cloned voice for all your projects.',
  },
  {
    id: 7,
    question: 'What file formats are supported for export?',
    answer:
      'All plans support MP3 export. Higher-tier plans (Studio and above) also support WAV, OGG, and FLAC formats. You can choose sample rates from 22kHz to 48kHz depending on your quality requirements.',
  },
  {
    id: 8,
    question: 'Is there a refund policy?',
    answer:
      'We offer a 14-day money-back guarantee for all annual plans. If you\'re not satisfied with SpeakStudio, contact our support team within 14 days of purchase for a full refund. Monthly plans are non-refundable but you can cancel anytime.',
  },
];

export default function FAQ() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <Box
      ref={ref}
      sx={{
        minHeight: 'auto',
        background: 'linear-gradient(135deg, #ffffff 0%, #f6f5f1 100%)',
        py: { xs: 8, md: 12 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container maxWidth="md">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 800,
                mb: 2,
                color: '#1a1a1a',
                letterSpacing: '-0.02em',
              }}
            >
              Frequently Asked{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Questions
              </Box>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.1rem' },
                color: '#4a4a4a',
                maxWidth: '700px',
                mx: 'auto',
              }}
            >
              Everything you need to know about SpeakStudio
            </Typography>
          </Box>
        </motion.div>

        {/* FAQ Accordions */}
        <Box sx={{ mt: 4 }}>
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Accordion
                expanded={expanded === `panel${faq.id}`}
                onChange={handleChange(`panel${faq.id}`)}
                sx={{
                  mb: 2,
                  borderRadius: '12px !important',
                  border: '1px solid rgba(26, 26, 26, 0.08)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: 'none',
                  '&:before': {
                    display: 'none',
                  },
                  '&.Mui-expanded': {
                    margin: '0 0 16px 0',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      sx={{
                        color: '#1a1a1a',
                        fontSize: '1.75rem',
                      }}
                    />
                  }
                  sx={{
                    minHeight: '72px',
                    px: 3,
                    '&.Mui-expanded': {
                      minHeight: '72px',
                    },
                    '& .MuiAccordionSummary-content': {
                      my: 2,
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: '1rem', md: '1.125rem' },
                      fontWeight: 600,
                      color: '#1a1a1a',
                      lineHeight: 1.5,
                    }}
                  >
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    px: 3,
                    pb: 3,
                    pt: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      color: '#4a4a4a',
                      lineHeight: 1.7,
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          ))}
        </Box>

        {/* Still have questions? CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Box
            sx={{
              textAlign: 'center',
              mt: 6,
              p: 4,
              borderRadius: '16px',
              backgroundColor: 'rgba(26, 26, 26, 0.03)',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 1,
                color: '#1a1a1a',
              }}
            >
              Still have questions?
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#4a4a4a',
                mb: 0,
              }}
            >
              Contact our support team at{' '}
              <Box
                component="a"
                href="mailto:support@speaklab.ai"
                sx={{
                  color: '#1a1a1a',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                support@speaklab.ai
              </Box>
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
