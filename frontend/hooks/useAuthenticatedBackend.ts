import { useAuth } from '../contexts/AuthContext';
import backend from '~backend/client';

export function useAuthenticatedBackend() {
  const { token } = useAuth();

  const authenticatedBackend = {
    region: {
      list: backend.region.list,
      get: backend.region.get,
      create: (data: any) => backend.region.create({ ...data, authorization: `Bearer ${token}` }),
      update: (params: any, data: any) => backend.region.update({ id: params.id, ...data, authorization: `Bearer ${token}` }),
      deleteRegion: (params: any) => backend.region.deleteRegion({ ...params, authorization: `Bearer ${token}` }),
    },
    bonus: {
      list: backend.bonus.list,
      listBonusTypes: backend.bonus.listBonusTypes,
      stats: backend.bonus.stats,
      create: (data: any) => backend.bonus.create({ ...data, authorization: `Bearer ${token}` }),
      approve: (data: any) => backend.bonus.approve({ ...data, authorization: `Bearer ${token}` }),
      reject: (data: any) => backend.bonus.reject({ ...data, authorization: `Bearer ${token}` }),
    },
    training: {
      listCourses: backend.training.listCourses,
      listCategories: backend.training.listCategories,
      getStats: backend.training.getStats,
      createCourse: (data: any) => backend.training.createCourse({ ...data, authorization: `Bearer ${token}` }),
      enrollEmployee: (data: any) => backend.training.enrollEmployee({ ...data, authorization: `Bearer ${token}` }),
    },
    recruitment: {
      listJobPostings: backend.recruitment.listJobPostings,
      listCandidates: backend.recruitment.listCandidates,
      listInterviews: backend.recruitment.listInterviews,
      getRecruitmentStats: backend.recruitment.getRecruitmentStats,
      createJobPosting: (data: any) => backend.recruitment.createJobPosting({ ...data, authorization: `Bearer ${token}` }),
      createCandidate: (data: any) => backend.recruitment.createCandidate({ ...data, authorization: `Bearer ${token}` }),
      createInterview: (data: any) => backend.recruitment.createInterview({ ...data, authorization: `Bearer ${token}` }),
    }
  };

  return authenticatedBackend;
}