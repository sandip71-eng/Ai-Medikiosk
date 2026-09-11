import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['patient', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    language: {
      type: String,
      default: 'en-IN',
    },
    inputType: {
      type: String,
      enum: ['text', 'audio'],
      default: 'text',
    },
  },
  { _id: false }
);

const painSocratesSchema = new mongoose.Schema(
  {
    site: { type: String, default: '' },
    onset: { type: String, default: '' },
    character: { type: String, default: '' },
    radiation: { type: String, default: '' },
    associatedSymptoms: { type: [String], default: [] },
    timing: { type: String, default: '' },
    exacerbatingRelieving: { type: String, default: '' },
    severity: { type: String, default: '' },
  },
  { _id: false }
);

const consultationSchema = new mongoose.Schema(
  {
    consultationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patientId: {
      type: String,
      required: true,
      index: true,
    },
    language: {
      type: String,
      default: 'en-IN',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned', 'emergency_stopped'],
      default: 'active',
      index: true,
    },
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'emergency'],
      default: 'routine',
      index: true,
    },
    dashavidhaMode: {
      type: Boolean,
      default: false,
    },
    conversationStage: {
      type: String,
      enum: [
        'CHIEF_COMPLAINT',
        'HPI_SOCRATES',
        'PAST_MEDICAL_HISTORY',
        'MEDICATIONS_ALLERGIES',
        'REVIEW_OF_SYSTEMS',
        'COMPLETED',
      ],
      default: 'CHIEF_COMPLAINT',
    },
    clinicalState: {
      chiefComplaint: { type: String, default: '' },
      isPainComplaint: { type: Boolean, default: false },
      painSocrates: { type: painSocratesSchema, default: () => ({}) },
      completedFields: { type: [String], default: [] },
      missingFields: {
        type: [String],
        default: [
          'chiefComplaint',
          'onset',
          'duration',
          'severity',
          'associatedSymptoms',
          'medicalHistory',
          'medications',
          'allergies',
        ],
      },
      redFlags: { type: [String], default: [] },
      dashavidhaAssessment: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    consent: {
      dataConsent: { type: Boolean, default: true },
      audioConsent: { type: Boolean, default: true },
      timestamp: { type: Date, default: Date.now },
    },
    messages: [messageSchema],
    clinicalSummary: {
      type: String,
      default: '',
    },
    report: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Method to return safe presentation object without sensitive internal database IDs
consultationSchema.methods.toClientJSON = function () {
  return {
    consultationId: this.consultationId,
    patientId: this.patientId,
    language: this.language,
    status: this.status,
    urgency: this.urgency,
    conversationStage: this.conversationStage,
    dashavidhaMode: this.dashavidhaMode,
    messagesCount: this.messages.length,
    clinicalState: {
      chiefComplaint: this.clinicalState.chiefComplaint,
      completedFields: this.clinicalState.completedFields,
      missingFields: this.clinicalState.missingFields,
      redFlags: this.clinicalState.redFlags,
    },
    reportAvailable: !!this.report,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Consultation = mongoose.model('Consultation', consultationSchema);
export default Consultation;
