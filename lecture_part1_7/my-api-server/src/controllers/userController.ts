import { Request, Response } from "express";

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { name, email, bio } = req.body;

    // 사용자 프로필 업데이트 로직
    const updatedProfile = {
      id: userId,
      name,
      email,
      bio,
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      message: "프로필이 성공적으로 업데이트되었습니다",
      data: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "프로필 업데이트 중 오류가 발생했습니다",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
  }
};
