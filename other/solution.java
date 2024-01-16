package other;
import java.util.HashSet;
import java.util.Set;

class Solution {


    public static void main(String[] args) {
        int[] nums = {1,2,3,4,5,5};



        System.out.println(containsDuplicate(nums));
    }

    public static boolean containsDuplicate(int[] nums) {
        Set<Integer> uniques = new HashSet<>();
        
        for (int i = 0; i < nums.length; i++) {
            if (uniques.contains(nums[i])) {
                return true;
            }
            uniques.add(nums[i]);
        }
        return false;
    }


}

