-- Add title field to questionnaire_responses table
ALTER TABLE public.questionnaire_responses ADD COLUMN title TEXT;

-- Add index for querying by title
CREATE INDEX idx_questionnaire_responses_title ON public.questionnaire_responses(title);
