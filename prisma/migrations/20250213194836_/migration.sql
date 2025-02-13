-- CreateTable
CREATE TABLE "UniqueReviews" (
    "userId" TEXT NOT NULL,
    "reviewId" INTEGER NOT NULL,

    CONSTRAINT "UniqueReviews_pkey" PRIMARY KEY ("userId","reviewId")
);
